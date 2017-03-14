'use strict';

const assert = require('assert');
const knex = require('../../db/knex');
const birds = require('../../models/bird');

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

const validId = '91b3f4c9-cff0-4147-a68a-65c4962208e0';
const invalidId = '91b3f4c9-cff0-4147-a68a-65c4962208e1';

const validateRobin = (robin) => {
  assert.strictEqual(robin.id, validId);
  assert.strictEqual(robin.commonName, 'Robin');
  assert.strictEqual(robin.scientificName, 'Robin Robin');
  assert.strictEqual(robin.familyName, 'Muscicapidae');
  assert.strictEqual(robin.family, 'Old World flycatchers and chats');
  assert.strictEqual(robin.order, 'Passeriformes');
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
    it('returns both species and subspecies', async () => {
      const results = await birds.all();

      assert.strictEqual(results.length, 5);
    });

    it('supports the perPage option', async () => {
      const results = await birds.all({
        perPage: 1
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].id, validId);
    });

    it('supports a perPage of 0', async () => {
      const results = await birds.all({
        perPage: 0
      });

      assert.strictEqual(results.length, 0);
    });

    it('supports the page option', async () => {
      const results = await birds.all({
        perPage: 2,
        page: 2
      });

      assert.strictEqual(results.length, 2);
      assert.equal(results[0].commonName, 'Eagle');
    });

    // TODO: find a better way of testing search queries
    it('filters the results based on the query option', async () => {
      const results = await birds.all({
        query: 'rob'
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].commonName, 'Robin');
    });

    it('filters the results based on the scientificName option', async () => {
      const results = await birds.all({
        scientificName: 'Eagle Eagle'
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].id, 'ec56048e-0695-11e7-9d5b-9f01cdc37617');
    });
  });

  describe('.subspecies', () => {
    const eagleId = 'ec56048e-0695-11e7-9d5b-9f01cdc37617';

    it('only returns the subspecies (not species)', async () => {
      const results = await birds.subspecies(eagleId);

      assert.strictEqual(results.length, 2);
    });

    it('returns the species_id for subspecies', async () => {
      const results = await birds.subspecies(eagleId);

      assert.strictEqual(results[0].speciesId, eagleId);
    });

    it('supports the perPage option', async () => {
      const results = await birds.subspecies(eagleId, {
        perPage: 1
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].id, '73e3f4ba-073b-11e7-916c-9747cb349ce0');
    });

    it('supports a perPage of 0', async () => {
      const results = await birds.subspecies(eagleId, {
        perPage: 0
      });

      assert.strictEqual(results.length, 0);
    });

    it('supports the page option', async () => {
      const results = await birds.subspecies(eagleId, {
        perPage: 1,
        page: 2
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].scientificName, 'Eagle Eagle Beagle');
    });
  });

  describe('.count', () => {
    it('returns the total count of birds', async () => {
      const result = await birds.count();
      assert.strictEqual(result, 5);
    });
  });

  describe('.countSubspecies', () => {
    const eagleId = 'ec56048e-0695-11e7-9d5b-9f01cdc37617';

    it('returns the total count of subspecies for a given species', async () => {
      const result = await birds.countSubspecies(eagleId);
      assert.strictEqual(result, 2);
    });
  });

  describe('.find', () => {
    it('returns the bird with the given ID', async () => {
      const robin = await birds.find(validId);

      validateRobin(robin);
    });

    it('returns the count of subspecies', async () => {
      const eagle = await birds.find('ec56048e-0695-11e7-9d5b-9f01cdc37617');

      assert.strictEqual(eagle.subspecies, 2);
    });

    it('returns a count of 0 subspecies for a species with no subspecies', async () => {
      const robin = await birds.find(validId);

      assert.strictEqual(robin.subspecies, 0);
    });

    it('returns undefined when the bird cannot be found', async () => {
      const nope = await birds.find(invalidId);
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
        sort: 10
      };
    });

    it('saves the bird in the database', async () => {
      const confirmation = await birds.create(validBird);

      assert.strictEqual(validBird.commonName, confirmation.commonName);
      assert.strictEqual(validBird.scientificName, confirmation.scientificName);
      assert.strictEqual(validBird.familyName, confirmation.familyName);
      assert.strictEqual(validBird.family, confirmation.family);
      assert.strictEqual(validBird.order, confirmation.order);
      assert.deepEqual(validBird.alternativeNames, confirmation.alternativeNames);
    });

    it('returns the newly created bird object', async () => {
      const bird = await birds.create(validBird);

      assert.ok(bird.id.match(UUID));
      assert.strictEqual(bird.commonName, 'New Bird');
      assert.strictEqual(bird.scientificName, 'Newus Birdus');
      assert.strictEqual(bird.familyName, 'Muscicapidae');
      assert.strictEqual(bird.family, 'Old World flycatchers and chats');
      assert.strictEqual(bird.order, 'Passeriformes');

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
      await birds.delete(validId);
      const results = await birds.all();

      assert.strictEqual(results.length, 4);
    });

    it('returns 0 if the bird did not exist', async () => {
      const result = await birds.delete(invalidId);
      assert.strictEqual(result, 0);
    });
  });
});
