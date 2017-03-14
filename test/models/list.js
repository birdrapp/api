'use strict';

const assert = require('assert');
const knex = require('../../db/knex');
const birdList = require('../../models/list');

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

const validId = '91b3f4c9-cff0-4147-a68a-65c4962208e0';
const invalidId = '91b3f4c9-cff0-4147-a68a-65c4962208e1';
const newId = 'ec56048e-0695-11e7-9d5b-9f01cdc37617';

describe('BirdList', () => {
  beforeEach(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  describe('.all', () => {
    it('returns the bird lists in the database ordered by name', async () => {
      const results = await birdList.all();
      const birdLife = results[0];
      const aussie = results[1];
      const bou = results[2];

      assert.strictEqual(results.length, 3);

      assert.strictEqual(birdLife.name, 'Bird Life International List');
      assert.strictEqual(birdLife.description, 'The Bird Life International list');

      assert.strictEqual(aussie.name, 'The Australia List');
      assert.strictEqual(aussie.description, 'A list of birds in australia');

      assert.strictEqual(bou.id, '91b3f4c9-cff0-4147-a68a-65c4962208e0');
      assert.strictEqual(bou.name, 'The British List');
      assert.strictEqual(bou.description, 'The British List');
    });

    it('supports the perPage option', async () => {
      const results = await birdList.all({
        perPage: 1
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].name, 'Bird Life International List');
    });

    it('supports a perPage of 0', async () => {
      const results = await birdList.all({
        perPage: 0
      });

      assert.strictEqual(results.length, 0);
    });

    it('supports the page option', async () => {
      const results = await birdList.all({
        perPage: 2,
        page: 2
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].name, 'The British List');
    });
  });

  describe('.count', () => {
    it('returns the total count of bird lists in the database', async () => {
      const result = await birdList.count();
      assert.strictEqual(result, 3);
    });
  });

  describe('.find', () => {
    it('returns the bird list with the given ID', async () => {
      const bou = await birdList.find(validId);

      assert.strictEqual(bou.name, 'The British List');
      assert.strictEqual(bou.description, 'The British List');
    });

    it('returns undefined when the list cannot be found', async () => {
      const nope = await birdList.find(invalidId);
      assert.strictEqual(nope, undefined);
    });
  });

  describe('.create', () => {
    let validList;

    beforeEach(() => {
      validList = {
        name: 'New Bird List',
        description: 'This is my new bird list'
      };
    });

    it('saves the list in the database', async () => {
      await birdList.create(validList);
      const count = await birdList.count();

      assert.strictEqual(count, 4);
    });

    it('returns the newly created list object', async () => {
      const list = await birdList.create(validList);

      assert.ok(list.id.match(UUID));
      assert.strictEqual(list.name, 'New Bird List');
      assert.strictEqual(list.description, 'This is my new bird list');

      assert.notStrictEqual(list.createdAt, undefined);
      assert.notStrictEqual(list.updatedAt, undefined);
    });

    it('throws an error if an unexpected property is passed', async () => {
      const invalidList = {
        nope: 'Error',
        name: 'New Bird',
        description: 'Newus Birdus'
      };

      try {
        await birdList.create(invalidList);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });

    it('throws an error if a mandatory property is missing', async () => {
      const invalidList = {
        name: 'Newus Birdus'
      };

      try {
        await birdList.create(invalidList);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });
  });

  describe('.delete', () => {
    it('removes the list from the database', async () => {
      await birdList.delete(validId);
      const results = await birdList.count();

      assert.strictEqual(results, 2);
    });

    it('returns 1 if the list was deleted', async () => {
      const result = await birdList.delete(validId);
      assert.strictEqual(result, 1);
    });

    it('returns 0 if the list did not exist', async () => {
      const result = await birdList.delete(invalidId);
      assert.strictEqual(result, 0);
    });
  });

  describe('.birds', () => {
    it('returns the birds that are part of the list ordered by sort', async () => {
      const results = await birdList.birds(validId);

      assert.strictEqual(results.length, 2);

      assert.strictEqual(results[0].id, 'e67eb5d8-0695-11e7-9d5b-c70585d538fa');
      assert.strictEqual(results[1].id, '91b3f4c9-cff0-4147-a68a-65c4962208e0');
    });

    it('uses the local name of the bird', async () => {
      const results = await birdList.birds(validId);

      assert.strictEqual(results[1].commonName, 'British Robin');
    });

    it('uses the common name when no local name is provided', async () => {
      const results = await birdList.birds(validId);

      assert.strictEqual(results[0].commonName, 'Crow');
    });

    it('returns all the standard bird information', async () => {
      const results = await birdList.birds(validId);

      assert.strictEqual(results[1].id, '91b3f4c9-cff0-4147-a68a-65c4962208e0');
      assert.strictEqual(results[1].commonName, 'British Robin');
      assert.strictEqual(results[1].scientificName, 'Robin Robin');
      assert.strictEqual(results[1].familyName, 'Muscicapidae');
      assert.strictEqual(results[1].order, 'Passeriformes');
      assert.strictEqual(results[1].family, 'Old World flycatchers and chats');
    });

    it('supports the perPage option', async () => {
      const results = await birdList.birds(validId, {
        perPage: 1
      });

      assert.strictEqual(results.length, 1);
    });

    it('supports a perPage of 0', async () => {
      const results = await birdList.birds(validId, {
        perPage: 0
      });

      assert.strictEqual(results.length, 0);
    });

    it('supports the page option', async () => {
      const results = await birdList.birds(validId, {
        perPage: 1,
        page: 2
      });

      assert.strictEqual(results.length, 1);
      assert.equal(results[0].id, '91b3f4c9-cff0-4147-a68a-65c4962208e0');
    });
  });

  describe('.countBirds', () => {
    it('returns the total count of birds within a list', async () => {
      const result = await birdList.countBirds(validId);
      assert.strictEqual(result, 2);
    });
  });

  describe('.addBirdToList', () => {
    it('adds a record to the list_birds table', async () => {
      const original = await birdList.countBirds(validId);
      await birdList.addBirdToList(validId, {
        birdId: newId,
        sort: 4
      });
      const changed = await birdList.countBirds(validId);

      assert.strictEqual(changed, original + 1);
    });

    it('allows a local name', async () => {
      await birdList.addBirdToList(validId, {
        birdId: newId,
        localName: 'Rare Robin',
        sort: 4
      });
      const results = await birdList.birds(validId);
      assert.strictEqual(results[2].commonName, 'Rare Robin');
    });

    it('returns an error when trying to add a bird that already exists within the list', async () => {
      const invalidAddition = {
        birdId: validId
      };

      try {
        await birdList.addBirdToList(validId, invalidAddition);
      } catch (ex) {
        assert.notEqual(ex, undefined);
      }
    });
  });

  describe('.delete', () => {
    it('removes the bird from the list', async () => {
      await birdList.removeBirdFromList(validId, validId);
      const results = await birdList.countBirds(validId);

      assert.strictEqual(results, 1);
    });

    it('returns 1 if the bird was deleted', async () => {
      const result = await birdList.removeBirdFromList(validId, validId);
      assert.strictEqual(result, 1);
    });

    it('returns 0 if the list does not exist', async () => {
      const result = await birdList.removeBirdFromList(invalidId, validId);
      assert.strictEqual(result, 0);
    });

    it('returns 0 if the bird does not exist', async () => {
      const result = await birdList.removeBirdFromList(validId, invalidId);
      assert.strictEqual(result, 0);
    });
  });
});
