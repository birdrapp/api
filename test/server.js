const app = require('../server');
const assert = require('assert');
const birds = require('../db/birds');
const request = require('supertest');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe("GET /", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 200", async function () {
    sandbox.stub(birds, 'all').returns(Promise.resolve([]));

    await request(app)
      .get('/')
      .expect(200)
  });

  it("returns a list of birds", async function () {
    const results = [{
      id: 1,
      name: 'Robin'
    }, {
      id: 2,
      name: 'Crow'
    }];

    sandbox.stub(birds, 'all').returns(Promise.resolve(results));

    let response = await request(app)
      .get('/')
      .expect(200);

    assert.deepEqual(response.body.data, results);
  });

  it("returns a 500 if the database fails", async function () {
    sandbox.stub(birds, 'all').throws(new Error("Database failed"));

    let response = await request(app)
      .get('/')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
  });
});

describe("GET /:id", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 200", async function () {
    sandbox.stub(birds, 'find').withArgs('legit-bird').returns(Promise.resolve({}));

    await request(app)
      .get('/legit-bird')
      .expect(200);
  });

  it("returns a bird object", async function () {
    let bird = {
      id: 'legit-bird',
      name: 'Robin'
    };

    sandbox.stub(birds, 'find').withArgs('legit-bird').returns(Promise.resolve(bird));

    let response = await request(app)
      .get('/legit-bird')
      .expect(200);

    assert.deepEqual(response.body.data, bird);
  });

  it("returns a 404 for an unknown bird", async function () {
    sandbox.stub(birds, "find").withArgs("bird-that-doesnt-exist").returns(Promise.resolve());

    await request(app)
      .get('/bird-that-doesnt-exist')
      .expect(404);
  });

  it("returns a 500 when the database fails", async function () {
    sandbox.stub(birds, "find").withArgs("error-bird").throws(new Error("Bad bird"));

    let response = await request(app)
      .get('/error-bird')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
  });
});

describe("POST /", function () {
  let robin;

  beforeEach(function () {
    robin = {
      commonName: 'Robin',
      scientificName: 'Robin'
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("saves the bird with a 201 response", async function () {
    let stub = sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));
    await request(app)
      .post('/')
      .send(robin)
      .expect(201);

    assert.equal(stub.calledOnce, true);
  });

  it("returns the bird with an ID property", async function () {
    let expectedBird = {
      commonName: 'Robin',
      scientificName: 'Robin',
      id: 'robin'
    };

    sandbox.stub(birds, "create").withArgs(robin).returns(Promise.resolve(expectedBird));

    let response = await request(app)
      .post('/')
      .send(robin)
      .expect(201);

    assert.deepEqual(expectedBird, response.body.data);
  });

  it("returns a 400 if you send invalid parameters", async function () {
    robin.invalid = 'Nope';

    const stub = sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/')
      .send(robin)
      .expect(400);

    assert.equal(stub.notCalled, true);
  });

  it("returns a 400 when mandatory parameters are missing", async function () {
    delete robin.commonName;

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/')
      .send(robin)
      .expect(400);
  });

  it("returns a 400 if you send it invalid JSON", async function () {
    const json = "{notJSON}";

    sandbox.stub(birds, 'create').withArgs(robin).returns(Promise.resolve(true));

    await request(app)
      .post('/')
      .send(json)
      .expect(400);
  });

  it("returns a 500 if the database throws an error", async function () {
    sandbox.stub(birds, "create").throws(new Error("Bad!"));

    await request(app)
      .post("/")
      .send(robin)
      .expect(500);
  });
});

describe("DELETE /:id", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 200", async function () {
    sandbox.stub(birds, "delete").withArgs('bird-id').returns(Promise.resolve(1));

    await request(app)
      .delete('/bird-id')
      .expect(204);
  });

  it("deletes the bird", async function () {
    let stub = sandbox.stub(birds, "delete").withArgs("bird-id").returns(Promise.resolve(1));

    await request(app)
      .delete("/bird-id")
      .expect(204);

    assert.equal(stub.calledOnce, true);
  });

  it("returns 404 if the bird does not exist", async function () {
    sandbox.stub(birds, "delete").withArgs("does-not-exist").returns(Promise.resolve(false));

    let response = await request(app)
      .delete("/does-not-exist")
      .expect(404);

    assert.strictEqual(response.body.statusCode, 404);
  });

  it("returns a 500 if the database throws an error", async function () {
    sandbox.stub(birds, "delete").withArgs("broken-bird").throws(new Error("Boink!"));

    await request(app)
      .delete("/broken-bird")
      .expect(500);
  });
});
