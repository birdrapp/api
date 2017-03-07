const assert = require('assert');
const href = require('../../lib/href');

describe('href', () => {
  it('appends the path to the host', () => {
    const result = href('/my/path');

    assert.strictEqual(result, 'http://localhost:8080/my/path');
  });
});
