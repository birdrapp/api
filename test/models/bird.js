const assert = require('assert');
const knex = require('../../db/knex');
const birds = require('../../models/bird');

const validateRobin = (robin) => {
  assert.strictEqual(robin.id, 'robin-robin');
  assert.strictEqual(robin.commonName, 'Robin');
  assert.strictEqual(robin.scientificName, 'Robin Robin');
  assert.strictEqual(robin.familyName, 'Muscicapidae');
  assert.strictEqual(robin.family, 'Old World flycatchers and chats');
  assert.strictEqual(robin.order, 'Passeriformes');
  assert.deepEqual(robin.alternateNames, ['European Robin']);
  assert.notStrictEqual(robin.createdAt, undefined);
  assert.notStrictEqual(robin.updatedAt, undefined);
};

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

      validateRobin(robin);
    });
  });

  describe('.find', () => {
    it('returns the bird with the given ID', async () => {
      const robin = await birds.find('robin-robin');

      validateRobin(robin);
    });

    it('returns an empty array when the bird has no alternate names', async () => {
      const eagle = await birds.find('eagle-eagle');

      assert.deepEqual(eagle.alternateNames, []);
    });

    it('returns undefined when the bird cannot be found', async () => {
      const nope = await birds.find('nope');
      assert.strictEqual(nope, undefined);
    });
  });

  describe('.create', () => {
    let validBird;
    beforeEach(() => {
      validBird = {
        commonName: 'New Bird',
        scientificName: 'Newus Birdus',
        familyName: 'Muscicapidae',
        family: 'Old World flycatchers and chats',
        order: 'Passeriformes',
        alternateNames: ['One', 'Two', 'Three']
      };
    });

    it('saves the bird in the database', async () => {
      const confirmation = await birds.create(validBird);

      assert.strictEqual(validBird.commonName, confirmation.commonName);
      assert.strictEqual(validBird.scientificName, confirmation.scientificName);
      assert.strictEqual(validBird.familyName, confirmation.familyName);
      assert.strictEqual(validBird.family, confirmation.family);
      assert.strictEqual(validBird.order, confirmation.order);
      assert.deepEqual(validBird.alternateNames, confirmation.alternateNames);
    });

    it('doesnt require alternate names', async () => {
      delete validBird.alternateNames;
      const confirmation = await birds.create(validBird);
      assert.deepEqual(confirmation.alternateNames, []);
    });

    it('uses a hyphenated version of the scientific name as an ID', async () => {
      const bird = await birds.create(validBird);

      assert.deepEqual(bird.id, 'newus-birdus');
    });

    it('returns the newly created bird object', async () => {
      const bird = await birds.create(validBird);

      assert.strictEqual(bird.id, 'newus-birdus');
      assert.strictEqual(bird.commonName, 'New Bird');
      assert.strictEqual(bird.scientificName, 'Newus Birdus');
      assert.strictEqual(bird.familyName, 'Muscicapidae');
      assert.strictEqual(bird.family, 'Old World flycatchers and chats');
      assert.strictEqual(bird.order, 'Passeriformes');
      assert.deepEqual(bird.alternateNames, ['One', 'Two', 'Three']);

      assert.notStrictEqual(bird.createdAt, undefined);
      assert.notStrictEqual(bird.updatedAt, undefined);
    });

    it('throws an error if an unexpected property is passed', async () => {
      const invalidBird = {
        nope: 'Error',
        commonName: 'New Bird',
        scientificName: 'Newus Birdus',
        familyName: 'Muscicapidae'
      };

      try {
        await birds.create(invalidBird);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });

    it('throws an error if a mandatory property is missing', async () => {
      const invalidBird = {
        scientificName: 'Newus Birdus',
        familyName: 'Muscicapidae'
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
