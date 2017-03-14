'use strict';

const app = require('../../server');
const assert = require('assert');
const birdList = require('../../models/list');
const request = require('supertest');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

describe('Bird Lists', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /lists', () => {
    const lists = [{
      id: 'bou',
      count: 500
    }, {
      id: 'bird-life',
      count: 11000
    }, {
      id: 'australia',
      count: 1234
    }];

    beforeEach(() => {
      sandbox.stub(birdList, 'all').returns(Promise.resolve(lists));
      sandbox.stub(birdList, 'count').returns(Promise.resolve(0));
    });

    it('returns a 200', async () => {
      await request(app)
        .get('/lists')
        .expect(200);
    });

    it('returns the bird lists from the database', async () => {
      const response = await request(app)
        .get('/lists')
        .expect(200);

      assert.deepEqual(response.body.data, lists);
    });

    it('returns a 500 when the database throws an error', async () => {
      birdList.all.throws(new Error('Whoops'));

      await request(app)
        .get('/lists')
        .expect(500);
    });

    it('returns an empty array when no lists exist', async () => {
      birdList.all.returns(Promise.resolve([]));

      const response = await request(app)
        .get('/lists')
        .expect(200);

      assert.deepEqual(response.body.data, []);
    });

    it('adds a link to each resource', async () => {
      const response = await request(app)
        .get('/lists')
        .expect(200);

      assert.equal(response.body.data[0].links.self, 'http://localhost:8080/lists/bou');
      assert.equal(response.body.data[1].links.self, 'http://localhost:8080/lists/bird-life');
    });

    describe('pagination', () => {
      it('returns the per page in the response', async () => {
        const response = await request(app)
          .get('/lists?perPage=4')
          .expect(200);

        assert.strictEqual(response.body.perPage, 4);
      });

      it('returns the page in the response', async () => {
        const response = await request(app)
          .get('/lists?page=2')
          .expect(200);

        assert.strictEqual(response.body.page, 2);
      });

      it('returns the total in the response', async () => {
        birdList.count.returns(Promise.resolve(4));

        const response = await request(app)
          .get('/lists')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
      });

      it('returns a 500 if the total count fails', async () => {
        birdList.count.throws(new Error('Whoops'));

        await request(app).get('/lists').expect(500);
      });

      it('sends the pagination parameters to the database', async () => {
        await request(app)
          .get('/lists?page=3&perPage=17')
          .expect(200);

        sinon.assert.calledWith(birdList.all, sinon.match({
          page: 3,
          perPage: 17
        }));
      });

      it('returns an error when the page parameter is invalid', async () => {
        await request(app).get('/lists?page=ibl').expect(400);
      });

      it('returns an error when page <= 0', async () => {
        await request(app).get('/lists?page=-1').expect(400);
        await request(app).get('/lists?page=0').expect(400);
      });

      it('returns an error when the perPage parameter is invalid', async () => {
        await request(app).get('/lists?perPage=ibl').expect(400);
      });

      it('returns an error when perPage < 0', async () => {
        await request(app).get('/lists?perPage=-1').expect(400);
      });

      it('returns an empty result set when perPage is 0', async () => {
        birdList.all.withArgs(sinon.match({
          page: 1,
          perPage: 0
        })).returns(Promise.resolve([]));

        birdList.count.returns(Promise.resolve(4));

        const response = await request(app)
          .get('/lists?perPage=0')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
        assert.deepEqual(response.body.data, []);
      });

      it('defaults to page 1 and perPage 20', async () => {
        const response = await request(app)
          .get('/lists')
          .expect(200);

        sinon.assert.calledWith(birdList.all, sinon.match({
          page: 1,
          perPage: 20
        }));

        assert.strictEqual(response.body.page, 1);
        assert.strictEqual(response.body.perPage, 20);
      });

      it('returns the links for the next and previous pages', async () => {
        birdList.all.returns(Promise.resolve(lists));
        birdList.count.returns(Promise.resolve(9));

        const response = await request(app)
          .get('/lists?page=2&perPage=1')
          .expect(200);

        assert.strictEqual(response.body.links.next, 'http://localhost:8080/lists?page=3&perPage=1');
        assert.strictEqual(response.body.links.previous, 'http://localhost:8080/lists?page=1&perPage=1');
      });
    });
  });

  describe('GET /lists/:id', () => {
    const expectedBirdList = {
      id: 'bou',
      birds: 201
    };

    beforeEach(() => {
      sandbox.stub(birdList, 'find').returns(Promise.resolve(expectedBirdList));
    });

    it('returns a 200', async () => {
      await request(app)
        .get('/lists/bou')
        .expect(200);
    });

    it('returns the bird list from the database', async () => {
      const response = await request(app)
        .get('/lists/bou')
        .expect(200);

      assert.deepEqual(response.body, expectedBirdList);
      sinon.assert.calledWith(birdList.find, 'bou');
    });

    it('returns a 500 when the database throws an error', async () => {
      birdList.find.throws(new Error('Whoops'));
      await request(app)
        .get('/lists/bou')
        .expect(500);
    });

    it('returns a 404 for an unknown list', async () => {
      birdList.find.withArgs('nope').returns();

      await request(app)
        .get('/lists/nope')
        .expect(404);
    });
  });

  describe('GET /lists/:id/birds', () => {
    const birds = [{
      id: 'robin',
      commonName: 'Robin'
    }, {
      id: 'crow',
      commonName: 'Crow'
    }];

    const list = {
      id: 'bou',
      name: 'The British List'
    };

    beforeEach(() => {
      sandbox.stub(birdList, 'find').returns(Promise.resolve(list));
      sandbox.stub(birdList, 'birds').returns(Promise.resolve(birds));
      sandbox.stub(birdList, 'countBirds').returns(Promise.resolve(100));
    });

    it('returns a 200', async () => {
      await request(app)
        .get('/lists/bou/birds')
        .expect(200);
    });

    it('returns the list of birds associated with this list', async () => {
      const response = await request(app)
        .get('/lists/bou/birds')
        .expect(200);

      assert.deepEqual(response.body.data, birds);
    });

    it('returns the list object in the response', async () => {
      const response = await request(app)
        .get('/lists/bou/birds')
        .expect(200);

      assert.deepEqual(response.body.birdList, list);
    });

    it('returns an empty array when no birds exist in the list', async () => {
      birdList.birds.withArgs('bou').returns(Promise.resolve([]));

      const response = await request(app)
        .get('/lists/bou/birds')
        .expect(200);

      assert.deepEqual(response.body.data, []);
    });

    it('returns a 500 when the database throws an error', async () => {
      birdList.birds.withArgs('bou').throws(new Error());
      await request(app).get('/lists/bou/birds').expect(500);

      birdList.find.withArgs('bou').throws(new Error());
      await request(app).get('/lists/bou/birds').expect(500);
    });

    it('adds a link to each resource', async () => {
      const response = await request(app)
        .get('/lists/bou/birds')
        .expect(200);

      assert.equal(response.body.data[0].links.self, 'http://localhost:8080/birds/robin');
      assert.equal(response.body.data[1].links.self, 'http://localhost:8080/birds/crow');
    });

    describe('pagination', () => {
      it('returns the per page in the response', async () => {
        const response = await request(app)
          .get('/lists/bou/birds?perPage=4')
          .expect(200);

        assert.strictEqual(response.body.perPage, 4);
      });

      it('returns the page in the response', async () => {
        const response = await request(app)
          .get('/lists/bou/birds?page=2')
          .expect(200);

        assert.strictEqual(response.body.page, 2);
      });

      it('returns the total in the response', async () => {
        birdList.countBirds.withArgs('bou').returns(Promise.resolve(4));

        const response = await request(app)
          .get('/lists/bou/birds')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
      });

      it('returns a 500 if the total count fails', async () => {
        birdList.countBirds.throws(new Error('Whoops'));

        await request(app).get('/lists').expect(500);
      });

      it('sends the pagination parameters to the database', async () => {
        await request(app)
          .get('/lists/bou/birds?page=3&perPage=17')
          .expect(200);

        sinon.assert.calledWith(birdList.birds, 'bou', sinon.match({
          page: 3,
          perPage: 17
        }));
      });

      it('returns an error when the page parameter is invalid', async () => {
        await request(app).get('/lists/bou/birds?page=ibl').expect(400);
      });

      it('returns an error when page <= 0', async () => {
        await request(app).get('/lists?page=-1').expect(400);
        await request(app).get('/lists?page=0').expect(400);
      });

      it('returns an error when the perPage parameter is invalid', async () => {
        await request(app).get('/lists?perPage=ibl').expect(400);
      });

      it('returns an error when perPage < 0', async () => {
        await request(app).get('/lists?perPage=-1').expect(400);
      });

      it('returns an empty result set when perPage is 0', async () => {
        birdList.birds.withArgs('bou', sinon.match({
          page: 1,
          perPage: 0
        })).returns(Promise.resolve([]));

        birdList.countBirds.withArgs('bou').returns(Promise.resolve(4));

        const response = await request(app)
          .get('/lists/bou/birds?perPage=0')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
        assert.deepEqual(response.body.data, []);
      });

      it('defaults to page 1 and perPage 20', async () => {
        const response = await request(app)
          .get('/lists/bou/birds')
          .expect(200);

        sinon.assert.calledWith(birdList.birds, 'bou', sinon.match({
          page: 1,
          perPage: 20
        }));

        assert.strictEqual(response.body.page, 1);
        assert.strictEqual(response.body.perPage, 20);
      });

      it('returns the links for the next and previous pages', async () => {
        birdList.birds.returns(Promise.resolve(birds));
        birdList.countBirds.returns(Promise.resolve(9));

        const response = await request(app)
          .get('/lists/bou/birds?page=2&perPage=1')
          .expect(200);

        assert.strictEqual(response.body.links.next, 'http://localhost:8080/lists/bou/birds?page=3&perPage=1');
        assert.strictEqual(response.body.links.previous, 'http://localhost:8080/lists/bou/birds?page=1&perPage=1');
      });
    });
  });

  describe('POST /lists/:id/birds', () => {
    let robin;

    beforeEach(() => {
      sandbox.stub(birdList, 'addBirdToList').returns(Promise.resolve(true));
      robin = {
        birdId: 'robin',
        sort: 1
      };
    });

    it('adds a bird to the list', async () => {
      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(204);

      sinon.assert.calledWith(birdList.addBirdToList, 'bou', sinon.match({
        birdId: 'robin'
      }));
    });

    it('can accept a local name for the bird', async () => {
      robin.localName = 'British Robin';

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(204);

      sinon.assert.calledWith(birdList.addBirdToList, 'bou', sinon.match({
        birdId: 'robin',
        localName: 'British Robin'
      }));
    });

    it('requires a sort number', async () => {
      delete robin.sort;

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(400);

      sinon.assert.notCalled(birdList.addBirdToList);
    });

    it('returns a 400 if you send invalid parameters', async () => {
      robin.invalid = 'ibl';

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(400);

      sinon.assert.notCalled(birdList.addBirdToList);
    });

    it('returns a 400 when mandatory parameters are missing', async () => {
      delete robin.birdId;

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(400);
    });

    it('returns a 409 when the bird is already a member of the list', async () => {
      const error = new Error('Bird already exists');
      error.code = '23505';

      birdList.addBirdToList.throws(error);

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(409);
    });

    it('returns a 400 if you send it invalid JSON', async () => {
      await request(app)
        .post('/lists/bou/birds')
        .send('{notJSON}')
        .expect(400);
    });

    it('returns a 500 if the database throws an error', async () => {
      birdList.addBirdToList.throws(new Error('Bad!'));

      await request(app)
        .post('/lists/bou/birds')
        .send(robin)
        .expect(500);
    });
  });

  describe('DELETE /lists/:list_id/birds/:bird_id', () => {
    beforeEach(() => {
      sandbox.stub(birdList, 'removeBirdFromList').returns(Promise.resolve(1));
    });

    it('returns a 204', async () => {
      await request(app)
        .delete('/lists/bou/birds/robin')
        .expect(204);
    });

    it('deletes the bird list', async () => {
      await request(app)
        .delete('/lists/bou/birds/robin')
        .expect(204);

      sinon.assert.calledWith(birdList.removeBirdFromList, 'bou', 'robin');
    });

    it('returns 404 if the list does not exist', async () => {
      birdList.removeBirdFromList.withArgs('does-not-exist', 'robin').returns(Promise.resolve(0));

      const response = await request(app)
        .delete('/lists/does-not-exist/birds/robin')
        .expect(404);

      assert.strictEqual(response.body.statusCode, 404);
    });

    it('returns 404 if the bird does not exist', async () => {
      birdList.removeBirdFromList.withArgs('bou', 'doesnt-exist').returns(Promise.resolve(0));

      const response = await request(app)
        .delete('/lists/bou/birds/doesnt-exist')
        .expect(404);

      assert.strictEqual(response.body.statusCode, 404);
    });

    it('returns a 500 if the database throws an error', async () => {
      birdList.removeBirdFromList.withArgs('broken-list').throws(new Error('Boink!'));

      await request(app)
        .delete('/lists/broken-list/birds/robin')
        .expect(500);
    });
  });


  describe('POST /lists', () => {
    let bou;

    beforeEach(() => {
      bou = {
        name: 'The British List',
        description: 'The British List is maintained by the BOU'
      };

      sandbox.stub(birdList, 'create').returns(Promise.resolve(bou));
    });

    it('saves the bird list with a 201 response', async () => {
      await request(app)
        .post('/lists')
        .send(bou)
        .expect(201);

      sinon.assert.calledWith(birdList.create, sinon.match({
        name: 'The British List',
        description: 'The British List is maintained by the BOU'
      }));
    });

    it('returns the newly created bird', async () => {
      const expected = Object.assign({ id: 'bou' }, bou);

      birdList.create.withArgs(bou).returns(Promise.resolve(expected));

      const response = await request(app)
        .post('/lists')
        .send(bou)
        .expect(201);

      assert.strictEqual(response.body.id, 'bou');
    });

    it('returns a 400 if you send invalid parameters', async () => {
      bou.invalid = 'Nope';

      birdList.create.withArgs(bou).returns(Promise.resolve(true));

      await request(app)
        .post('/lists')
        .send(bou)
        .expect(400);

      sinon.assert.notCalled(birdList.create);
    });

    it('returns a 400 when mandatory parameters are missing', async () => {
      delete bou.name;

      await request(app)
        .post('/lists')
        .send(bou)
        .expect(400);
    });

    it('returns a 400 if you send it invalid JSON', async () => {
      const json = '{notJSON}';

      await request(app)
        .post('/lists')
        .send(json)
        .expect(400);
    });

    it('returns a 500 if the database throws an error', async () => {
      birdList.create.throws(new Error('Bad!'));

      await request(app)
        .post('/lists')
        .send(bou)
        .expect(500);
    });
  });

  describe('DELETE /lists/:id', () => {
    beforeEach(() => {
      sandbox.stub(birdList, 'delete').returns(Promise.resolve(1));
    });

    it('returns a 204', async () => {
      await request(app)
        .delete('/lists/bou')
        .expect(204);
    });

    it('deletes the bird list', async () => {
      await request(app)
        .delete('/lists/bou')
        .expect(204);

      sinon.assert.calledWith(birdList.delete, 'bou');
    });

    it('returns 404 if the bird list does not exist', async () => {
      birdList.delete.withArgs('does-not-exist').returns(Promise.resolve(0));

      const response = await request(app)
        .delete('/lists/does-not-exist')
        .expect(404);

      assert.strictEqual(response.body.statusCode, 404);
    });

    it('returns a 500 if the database throws an error', async () => {
      birdList.delete.withArgs('broken-list').throws(new Error('Boink!'));

      await request(app)
        .delete('/lists/broken-list')
        .expect(500);
    });
  });
});
