const app = require('../server');
const assert = require('assert');
const db = require('../db');
const request = require('supertest');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

describe("GET /", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 200", async function () {
    sandbox.stub(db, 'listBirds').returns(Promise.resolve([]));

    await request(app)
      .get('/')
      .expect(200)
  });

  it("returns a list of birds", async function () {
    const birds = [{
      id: 1,
      name: 'Robin'
    }, {
      id: 2,
      name: 'Crow'
    }];

    sandbox.stub(db, 'listBirds').returns(Promise.resolve(birds));

    let response = await request(app)
      .get('/')
      .expect(200);

    assert.deepEqual(response.body.data, birds);
  });

  it("returns a 500 if the database fails", async function () {
    sandbox.stub(db, 'listBirds').throws(new Error("Database failed"));

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
    sandbox.stub(db, 'getBird').withArgs('legit-bird').returns(Promise.resolve({}));

    await request(app)
      .get('/legit-bird')
      .expect(200);
  });

  it("returns a bird object", async function () {
    let bird = {
      id: 'legit-bird',
      name: 'Robin'
    };

    sandbox.stub(db, 'getBird').withArgs('legit-bird').returns(Promise.resolve(bird));

    let response = await request(app)
      .get('/legit-bird')
      .expect(200);

    assert.deepEqual(response.body.data, bird);
  });

  it("returns a 404 for an unknown bird", async function () {
    sandbox.stub(db, "getBird").withArgs("bird-that-doesnt-exist").returns(Promise.resolve());

    await request(app)
      .get('/bird-that-doesnt-exist')
      .expect(404);
  });

  it("returns a 500 when the database fails", async function () {
    sandbox.stub(db, "getBird").withArgs("error-bird").throws(new Error("Bad bird"));

    let response = await request(app)
      .get('/error-bird')
      .expect(500);

    assert.strictEqual(response.body.statusCode, 500);
  });
});

describe("POST /", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 201 for a new bird", async function () {
    let bird = {
      name: 'Robin'
    };

    sandbox.stub(db, 'createBird').withArgs(bird).returns(Promise.resolve(true));

    await request(app)
      .post('/')
      .send(bird)
      .expect(201);
  });

  it("saves the bird", async function () {
    let bird = {
      name: 'Robin'
    };

    let stub = sandbox.stub(db, 'createBird').withArgs(bird).returns(Promise.resolve(true));
    await request(app)
      .post('/')
      .send(bird)
      .expect(201);

    assert.equal(stub.calledOnce, true);
  });

  it("returns the bird with an ID property", async function () {
    let bird = {
      name: 'Robin'
    };
    let savedBird = bird;
    savedBird.id = 'some id';

    sandbox.stub(db, "createBird").withArgs(bird).returns(Promise.resolve(savedBird));

    let response = await request(app)
      .post('/')
      .send(bird);

    assert.deepEqual(savedBird, response.body.data);
  });
});

describe("DELETE /:id", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("returns a 200", async function () {
    sandbox.stub(db, "deleteBird").withArgs('bird-id').returns(Promise.resolve(true));

    await request(app)
      .delete('/bird-id')
      .expect(204);
  });

  it("deletes the bird", async function () {
    let stub = sandbox.stub(db, "deleteBird").withArgs("bird-id").returns(Promise.resolve(true));

    await request(app)
      .delete("/bird-id")
      .expect(204);

    assert.equal(stub.calledOnce, true);
  });

  it("returns 404 if the bird does not exist", async function () {
    sandbox.stub(db, "deleteBird").withArgs("does-not-exist").returns(Promise.resolve(false));

    let response = await request(app)
      .delete("/does-not-exist")
      .expect(404);

    assert.strictEqual(response.body.statusCode, 404);
  });

  it("returns a 500 if the database throws an error", async function () {
    sandbox.stub(db, "deleteBird").withArgs("broken-bird").throws(new Error("Boink!"));

    await request(app)
      .delete("/broken-bird")
      .expect(500);
  });
});
