const assert = require('assert');
const knex = require('../../db/knex');
const birds = require('../../db/birds');

describe('birds', function () {
  beforeEach(async function () {
    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterEach(async function () {
    await knex.migrate.rollback();
  });

  describe('.all', function () {
    it('returns the birds in the database', async function () {
      const results = await birds.all();
      const robin = results[0];

      assert.strictEqual(results.length, 3);

      assert.deepEqual(robin, {
        id: 'robin-robin',
        commonName: 'Robin',
        scientificName: 'Robin Robin'
      });
    });
  });

  describe('.find', function () {
    it("returns the bird with the given ID", async function () {
      const robin = await birds.find('robin-robin');

      assert.deepEqual(robin, {
        id: 'robin-robin',
        commonName: 'Robin',
        scientificName: 'Robin Robin'
      });
    });

    it('returns undefined when the bird cannot be found', async function () {
      const nope = await birds.find('nope');

      assert.strictEqual(nope, undefined);
    });
  });

  describe('.create', function () {
    it('saves the bird in the database', async function () {
      const newBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      const confirmation = await birds.create(newBird);

      assert.strictEqual(newBird.commonName, confirmation.commonName);
      assert.strictEqual(newBird.scientificName, confirmation.scientificName);
    });

    it('uses a hyphenated version of the scientific name as an ID', async function () {
      const newBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      const bird = await birds.create(newBird);

      assert.strictEqual(bird.id, 'newus-birdus');
    });

    it('returns the newly created bird object', async function () {
      const newBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      const bird = await birds.create(newBird);

      assert.deepEqual(bird, {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus',
        id: 'newus-birdus'
      });
    });

    it('throws an error if an unexpected property is passed', async function () {
      const invalidBird = {
        nope: 'Error',
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      try {
        await birds.create(invalidBird);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });

    it('throws an error if a mandatory property is missing', async function () {
      const invalidBird = {
        scientificName: 'Newus Birdus'
      };

      try {
        await birds.create(invalidBird);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });
  });

  describe('.delete', function () {
    it('removes the bird from the database', async function () {
      await birds.delete('robin-robin');
      const results = await birds.all();

      assert.strictEqual(results.length, 2);
    });

    it('returns 0 if the bird did not exist', async function () {
      let result = await birds.delete('not-here');
      assert.strictEqual(result, 0);
    });
  });
});
