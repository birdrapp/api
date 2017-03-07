const app = require('../../server');
const assert = require('assert');
const birds = require('../../models/bird');
const href = require('../../lib/href');
const request = require('supertest');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

function createBirds(num) {
  let birds = [];
  for (var i = 1; i <= num; i++) {
    birds.push({
      id: i,
      name: 'Robin ' + i
    })
  }

  return birds;
}

describe('GET /v1/birds', () => {
  beforeEach(() => {
    sandbox.stub(birds, 'all').returns(Promise.resolve([]));
    sandbox.stub(birds, 'count').returns(Promise.resolve(0));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns a 200', async () => {
    await request(app)
      .get('/v1/birds')
      .expect(200)
  });

  it('returns the birds from the database', async () => {
    const results = createBirds(2);

    birds.all.returns(Promise.resolve(results));

    const response = await request(app)
      .get('/v1/birds')
      .expect(200);

    assert.strictEqual(response.body.data[0].id, 1);
    assert.strictEqual(response.body.data[0].name, 'Robin 1');
    assert.strictEqual(response.body.data[1].id, 2);
    assert.strictEqual(response.body.data[1].name, 'Robin 2');
  });

  it('adds a link to each resource', async () => {
    const results = createBirds(2)

    birds.all.returns(Promise.resolve(results));

    const response = await request(app)
      .get('/v1/birds')
      .expect(200);

    assert.equal(response.body.data[0].links.self, 'http://localhost:8080/v1/birds/1');
    assert.equal(response.body.data[1].links.self, 'http://localhost:8080/v1/birds/2');
  });

  it('returns a 500 if the database fails', async () => {
    birds.all.throws(new Error('Database failed'));

    const response = await request(app)
      .get('/v1/birds')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
  });

  describe('pagination', () => {
    it('returns the per page in the response', async () => {
      const response = await request(app)
        .get('/v1/birds?perPage=4')
        .expect(200);

      assert.strictEqual(response.body.perPage, 4);
    });

    it('returns the page in the response', async () => {
      const response = await request(app)
        .get('/v1/birds?page=2')
        .expect(200);

      assert.strictEqual(response.body.page, 2);
    });

    it('returns the total in the response', async () => {
      birds.count.returns(Promise.resolve(10000));

      const response = await request(app)
        .get('/v1/birds')
        .expect(200);

      assert.strictEqual(response.body.total, 10000);
    });

    it('returns a 500 if the total count fails', async () => {
      birds.count.throws(new Error('Whoops'));

      await request(app).get('/v1/birds').expect(500);
    });

    it('sends the pagination parameters to the database', async () => {
      await request(app)
        .get('/v1/birds?page=3&perPage=17')
        .expect(200);

      sinon.assert.calledWith(birds.all, sinon.match({
        page: 3,
        perPage: 17
      }));
    });

    it('returns an error when the page parameter is invalid', async () => {
      await request(app).get('/v1/birds?page=ibl').expect(400);
    });

    it('returns an error when page <= 0', async () => {
      await request(app).get('/v1/birds?page=-1').expect(400);
      await request(app).get('/v1/birds?page=0').expect(400);
    });

    it('returns an error when the perPage parameter is invalid', async () => {
      await request(app).get('/v1/birds?perPage=ibl').expect(400);
    });

    it('returns an error when perPage < 0', async () => {
      await request(app).get('/v1/birds?perPage=-1').expect(400);
    });

    it('returns an empty result set when perPage is 0', async () => {
      birds.all.withArgs(sinon.match({
        page: 1,
        perPage: 0
      })).returns(Promise.resolve([]));
      birds.count.returns(Promise.resolve(800));

      const response = await request(app)
        .get('/v1/birds?perPage=0')
        .expect(200);

      assert.strictEqual(response.body.total, 800);
      assert.deepEqual(response.body.data, []);
    });

    it('defaults to page 1 and perPage 20', async () => {
      const response = await request(app)
        .get('/v1/birds')
        .expect(200);

      sinon.assert.calledWith(birds.all, sinon.match({
        page: 1,
        perPage: 20
      }));
      assert.strictEqual(response.body.page, 1);
      assert.strictEqual(response.body.perPage, 20);
    });

    it('returns the links for the next and previous pages', async () => {
      const results = createBirds(3);
      birds.all.returns(Promise.resolve(results));
      birds.count.returns(Promise.resolve(9));

      const response = await request(app)
        .get('/v1/birds?page=2&perPage=1')
        .expect(200);

      assert.strictEqual(response.body.links.next, 'http://localhost:8080/v1/birds?page=3&perPage=1');
      assert.strictEqual(response.body.links.previous, 'http://localhost:8080/v1/birds?page=1&perPage=1');
    });
  });
});

describe('GET /v1/birds/:id', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('returns a 200', async () => {
    sandbox.stub(birds, 'find').withArgs('legit-bird').returns(Promise.resolve({}));

    await request(app)
      .get('/v1/birds/legit-bird')
      .expect(200);
  });

  it('returns a bird object', async () => {
    let bird = {
      id: 'legit-bird',
      name: 'Robin'
    };

    sandbox.stub(birds, 'find').withArgs('legit-bird').returns(Promise.resolve(bird));

    let response = await request(app)
      .get('/v1/birds/legit-bird')
      .expect(200);

    assert.deepEqual(response.body, bird);
  });

  it('returns a 404 for an unknown bird', async () => {
    sandbox.stub(birds, 'find').withArgs('bird-that-doesnt-exist').returns(Promise.resolve());

    await request(app)
      .get('/v1/birds/bird-that-doesnt-exist')
      .expect(404);
  });

  it('returns a 500 when the database fails', async () => {
    sandbox.stub(birds, 'find').withArgs('error-bird').throws(new Error('Bad bird'));

    let response = await request(app)
      .get('/v1/birds/error-bird')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
  });
});

describe('POST /birds', () => {
  let robin;

  beforeEach(() => {
    robin = {
      commonName: 'Robin',
      scientificName: 'Robin',
      familyName: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('saves the bird with a 201 response', async () => {
    let stub = sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));
    await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(201);

    assert.equal(stub.calledOnce, true);
  });

  it('returns the newly created bird', async () => {
    let expected = Object.assign({ id: 'robin-robin' }, robin);

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(expected));

    let response = await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(201);

    assert.strictEqual(response.body.id, 'robin-robin');
  });

  it('returns a 400 if you send invalid parameters', async () => {
    robin.invalid = 'Nope';

    const stub = sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(400);

    assert.equal(stub.notCalled, true);
  });

  it('returns a 400 when mandatory parameters are missing', async () => {
    delete robin.commonName;

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(400);
  });

  it('returns a 400 if you send it invalid JSON', async () => {
    const json = '{notJSON}';

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/v1/birds')
      .send(json)
      .expect(400);
  });

  it('returns a 500 if the database throws an error', async () => {
    sandbox.stub(birds, 'create').throws(new Error('Bad!'));

    await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(500);
  });
});

describe('DELETE /birds/:id', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('returns a 200', async () => {
    sandbox.stub(birds, 'delete').withArgs('bird-id').returns(Promise.resolve(1));

    await request(app)
      .delete('/v1/birds/bird-id')
      .expect(204);
  });

  it('deletes the bird', async () => {
    let stub = sandbox.stub(birds, 'delete').withArgs('bird-id').returns(Promise.resolve(1));

    await request(app)
      .delete('/v1/birds/bird-id')
      .expect(204);

    assert.equal(stub.calledOnce, true);
  });

  it('returns 404 if the bird does not exist', async () => {
    sandbox.stub(birds, 'delete').withArgs('does-not-exist').returns(Promise.resolve(false));

    let response = await request(app)
      .delete('/v1/birds/does-not-exist')
      .expect(404);

    assert.strictEqual(response.body.statusCode, 404);
  });

  it('returns a 500 if the database throws an error', async () => {
    sandbox.stub(birds, 'delete').withArgs('broken-bird').throws(new Error('Boink!'));

    await request(app)
      .delete('/v1/birds/broken-bird')
      .expect(500);
  });
});
