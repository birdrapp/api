'use strict';

const assert = require('assert');
const paginationLinks = require('../../lib/pagination_links');

describe('paginationLinks', () => {
  it('returns an object with previous and next links', () => {
    const result = paginationLinks({
      query: {}
    });
    assert.ok(result.next);
    assert.ok(result.previous);
  });

  it('returns null if no previous page', () => {
    const result = paginationLinks({
      query: {
        page: 1
      }
    });

    assert.strictEqual(result.previous, null);
  });

  it('returns null if no next page', () => {
    const result = paginationLinks({
      query: {
        page: 2,
        perPage: 10
      }
    }, 15);

    assert.strictEqual(result.next, null);
  });

  it('returns the correct next page', () => {
    const result = paginationLinks({
      query: {
        page: 1,
        perPage: 10
      },
      baseUrl: '/my/path',
      path: '/'
    }, 20);

    assert.strictEqual(result.next, 'http://localhost:8080/my/path?page=2&perPage=10');
  });

  it('returns the correct prev page', () => {
    const result = paginationLinks({
      query: {
        page: 2,
        perPage: 10
      },
      baseUrl: '/my/path',
      path: '/nested/resource'
    }, 20);

    assert.strictEqual(result.previous, 'http://localhost:8080/my/path/nested/resource?page=1&perPage=10');
  });

  it('leaves other query string parameters in tact', () => {
    const result = paginationLinks({
      query: {
        page: 2,
        perPage: 4,
        somethingElse: 'blah'
      },
      baseUrl: '/my/path'
    }, 20);

    assert.ok(result.previous.includes('somethingElse=blah'));
    assert.ok(result.next.includes('somethingElse=blah'));
  });
});
