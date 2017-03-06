const assert = require('assert');
const knex = require('../../db/knex');
const birds = require('../../models/bird');

describe('birds', () => {
  beforeEach(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  describe('.all', () => {
    it('returns the birds in the database', async () => {
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

  describe('.find', () => {
    it('returns the bird with the given ID', async () => {
      const robin = await birds.find('robin-robin');

      assert.strictEqual(robin.id, 'robin-robin');
      assert.strictEqual(robin.commonName, 'Robin');
      assert.strictEqual(robin.scientificName, 'Robin Robin');
      assert.notStrictEqual(robin.createdAt, undefined);
      assert.notStrictEqual(robin.updatedAt, undefined);
    });

    it('returns undefined when the bird cannot be found', async () => {
      const nope = await birds.find('nope');
      assert.strictEqual(nope, undefined);
    });
  });

  describe('.create', () => {
    it('saves the bird in the database', async () => {
      const newBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      const confirmation = await birds.create(newBird);

      assert.strictEqual(newBird.commonName, confirmation.commonName);
      assert.strictEqual(newBird.scientificName, confirmation.scientificName);
    });

    it('uses a hyphenated version of the scientific name as an ID', async () => {
      const newBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus'
      };

      const bird = await birds.create(newBird);

      assert.strictEqual(bird.id, 'newus-birdus');
    });

    it('returns the newly created bird object', async () => {
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

    it('throws an error if an unexpected property is passed', async () => {
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

    it('throws an error if a mandatory property is missing', async () => {
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

  describe('.delete', () => {
    it('removes the bird from the database', async () => {
      await birds.delete('robin-robin');
      const results = await birds.all();

      assert.strictEqual(results.length, 2);
    });

    it('returns 0 if the bird did not exist', async () => {
      let result = await birds.delete('not-here');
      assert.strictEqual(result, 0);
    });
  });
});
