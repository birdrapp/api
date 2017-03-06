const app = require('../../server');
const assert = require('assert');
const birds = require('../../models/bird');
const request = require('supertest');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe('GET /v1/birds', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('returns a 200', async () => {
    sandbox.stub(birds, 'all').returns(Promise.resolve([]));

    await request(app)
      .get('/v1/birds')
      .expect(200)
  });

  it('returns a list of birds', async () => {
    const results = [{
      id: 1,
      name: 'Robin'
    }, {
      id: 2,
      name: 'Crow'
    }];

    sandbox.stub(birds, 'all').returns(Promise.resolve(results));

    let response = await request(app)
      .get('/v1/birds')
      .expect(200);

    assert.deepEqual(response.body.data, results);
  });

  it('returns a 500 if the database fails', async () => {
    sandbox.stub(birds, 'all').throws(new Error('Database failed'));

    let response = await request(app)
      .get('/v1/birds')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
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
      scientificName: 'Robin'
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

  it('returns the bird with an ID property', async () => {
    let expectedBird = {
      commonName: 'Robin',
      scientificName: 'Robin',
      id: 'robin'
    };

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(expectedBird));

    let response = await request(app)
      .post('/v1/birds')
      .send(robin)
      .expect(201);

    assert.deepEqual(expectedBird, response.body);
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
