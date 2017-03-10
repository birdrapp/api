const app = require('../../server');
const assert = require('assert');
const birdLists = require('../../models/birdList');
const request = require('supertest');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

describe.only('GET /v1/bird-lists', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('returns a 200', async () => {
    await request(app)
      .get('/v1/bird-lists')
      .expect(200)
  });

  it('returns the bird lists from the database', async () => {
    const lists = [{
      id: 'bou'
    }];
    sandbox.stub(birdLists, 'all').returns(Promise.resolve(lists));

    const response = await request(app)
      .get('/v1/bird-lists')
      .expect(200);

    assert.deepEqual(response.body.data, lists);
  });
});
