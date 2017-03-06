const assert = require('assert');
const knex = require('../../db/knex');
const birds = require('../../models/bird');

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

      assert.strictEqual(robin.id, 'robin-robin');
      assert.strictEqual(robin.commonName, 'Robin');
      assert.strictEqual(robin.scientificName, 'Robin Robin');
      assert.notStrictEqual(robin.createdAt, undefined);
      assert.notStrictEqual(robin.updatedAt, undefined);
    });
  });

  describe('.find', function () {
    it('returns the bird with the given ID', async function () {
      const robin = await birds.find('robin-robin');

      assert.strictEqual(robin.id, 'robin-robin');
      assert.strictEqual(robin.commonName, 'Robin');
      assert.strictEqual(robin.scientificName, 'Robin Robin');
      assert.notStrictEqual(robin.createdAt, undefined);
      assert.notStrictEqual(robin.updatedAt, undefined);
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

      assert.strictEqual(bird.id, 'newus-birdus');
      assert.strictEqual(bird.commonName, 'New Bird');
      assert.strictEqual(bird.scientificName, 'Newus Birdus');
      assert.notStrictEqual(bird.createdAt, undefined);
      assert.notStrictEqual(bird.updatedAt, undefined);
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
