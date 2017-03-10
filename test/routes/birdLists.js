const app = require('../../server');
const assert = require('assert');
const birdList = require('../../models/birdList');
const request = require('supertest');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

describe.only('Bird Lists', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /v1/bird-lists', () => {
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
        .get('/v1/bird-lists')
        .expect(200)
    });

    it('returns the bird lists from the database', async () => {
      const response = await request(app)
        .get('/v1/bird-lists')
        .expect(200);

      assert.deepEqual(response.body.data, lists);
    });

    it('returns a 500 when the database throws an error', async () => {
      birdList.all.throws(new Error('Whoops'));

      await request(app)
        .get('/v1/bird-lists')
        .expect(500);
    });

    it('returns an empty array when no lists exist', async () => {
      birdList.all.returns(Promise.resolve([]));

      const response = await request(app)
        .get('/v1/bird-lists')
        .expect(200);

      assert.deepEqual(response.body.data, []);
    });

    it('adds a link to each resource', async () => {
      const response = await request(app)
        .get('/v1/bird-lists')
        .expect(200);

      assert.equal(response.body.data[0].links.self, 'http://localhost:8080/v1/bird-lists/bou');
      assert.equal(response.body.data[1].links.self, 'http://localhost:8080/v1/bird-lists/bird-life');
    });

    describe('pagination', () => {
      it('returns the per page in the response', async () => {
        const response = await request(app)
          .get('/v1/bird-lists?perPage=4')
          .expect(200);

        assert.strictEqual(response.body.perPage, 4);
      });

      it('returns the page in the response', async () => {
        const response = await request(app)
          .get('/v1/bird-lists?page=2')
          .expect(200);

        assert.strictEqual(response.body.page, 2);
      });

      it('returns the total in the response', async () => {
        birdList.count.returns(Promise.resolve(4));

        const response = await request(app)
          .get('/v1/bird-lists')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
      });

      it('returns a 500 if the total count fails', async () => {
        birdList.count.throws(new Error('Whoops'));

        await request(app).get('/v1/bird-lists').expect(500);
      });

      it('sends the pagination parameters to the database', async () => {
        await request(app)
          .get('/v1/bird-lists?page=3&perPage=17')
          .expect(200);

        sinon.assert.calledWith(birdList.all, sinon.match({
          page: 3,
          perPage: 17
        }));
      });

      it('returns an error when the page parameter is invalid', async () => {
        await request(app).get('/v1/bird-lists?page=ibl').expect(400);
      });

      it('returns an error when page <= 0', async () => {
        await request(app).get('/v1/bird-lists?page=-1').expect(400);
        await request(app).get('/v1/bird-lists?page=0').expect(400);
      });

      it('returns an error when the perPage parameter is invalid', async () => {
        await request(app).get('/v1/bird-lists?perPage=ibl').expect(400);
      });

      it('returns an error when perPage < 0', async () => {
        await request(app).get('/v1/bird-lists?perPage=-1').expect(400);
      });

      it('returns an empty result set when perPage is 0', async () => {
        birdList.all.withArgs(sinon.match({
          page: 1,
          perPage: 0
        })).returns(Promise.resolve([]));

        birdList.count.returns(Promise.resolve(4));

        const response = await request(app)
          .get('/v1/bird-lists?perPage=0')
          .expect(200);

        assert.strictEqual(response.body.total, 4);
        assert.deepEqual(response.body.data, []);
      });

      it('defaults to page 1 and perPage 20', async () => {
        const response = await request(app)
          .get('/v1/bird-lists')
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
          .get('/v1/bird-lists?page=2&perPage=1')
          .expect(200);

        assert.strictEqual(response.body.links.next, 'http://localhost:8080/v1/bird-lists?page=3&perPage=1');
        assert.strictEqual(response.body.links.previous, 'http://localhost:8080/v1/bird-lists?page=1&perPage=1');
      });
    });
  });

  describe('GET /v1/bird-lists/:id', () => {
    const expectedBirdList = {
      id: 'bou',
      birds: 201
    };

    beforeEach(() => {
      sandbox.stub(birdList, 'find').returns(Promise.resolve(expectedBirdList));
    });

    it('returns a 200', async () => {
      await request(app)
        .get('/v1/bird-lists/bou')
        .expect(200);
    });

    it('returns the bird list from the database', async () => {
      const response = await request(app)
        .get('/v1/bird-lists/bou')
        .expect(200);

      assert.deepEqual(response.body, expectedBirdList);
      sinon.assert.calledWith(birdList.find, 'bou');
    });

    it('returns a 500 when the database throws an error', async () => {
      birdList.find.throws(new Error('Whoops'));
      await request(app)
        .get('/v1/bird-lists/bou')
        .expect(500);
    });

    it('returns a 404 for an unknown list', async () => {
      birdList.find.withArgs('nope').returns();

      await request(app)
        .get('/v1/bird-lists/nope')
        .expect(404);
    });
  });
});