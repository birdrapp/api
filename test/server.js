'use strict';

const app = require('../server');
const request = require('supertest');

describe('Server', () => {
  it('supports CORS', async () => {
    await request(app)
      .get('/')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  });
});
