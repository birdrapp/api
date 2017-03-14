'use strict';

const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('../db/knex');

const List = () => knex('lists');
const ListBird = () => knex('list_birds');

const rowToList = (row) => {
  if (row === undefined) return;

  return _.mapKeys(row, (v, k) => changeCase.camel(k));
};

module.exports.all = async (opts = {}) => {
  const limit = opts.perPage;
  const offset = (opts.page - 1) * limit;

  const query = List().select().orderBy('name');

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToList);
};

module.exports.birds = async (listId, opts = {}) => {
  const limit = opts.perPage;
  const offset = (opts.page - 1) * limit;

  const query = ListBird()
    .select([
      knex.raw('coalesce(list_birds.local_name, birds.common_name) as common_name'),
      'list_birds.created_at',
      'list_birds.updated_at',
      'birds.scientific_name',
      'birds.order',
      'birds.family_name',
      'birds.family',
      'birds.id'
    ])
    .innerJoin('birds', 'birds.id', 'list_birds.bird_id')
    .where('list_id', listId)
    .orderBy('list_birds.sort', 'birds.sort');

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return query.map(rowToList);
};

module.exports.count = async () => {
  const result = await List().count('id as count');
  return parseInt(result[0].count);
};

module.exports.countBirds = async (id) => {
  const result = await ListBird().where('list_id', id).count('bird_id');
  return parseInt(result[0].count);
};

module.exports.find = async (id) => {
  return rowToList(await List()
    .select()
    .where('id', id)
    .first());
};

module.exports.create = async (list) => {
  const ids = await List().insert(list, 'id');
  return await module.exports.find(ids[0]);
};

module.exports.delete = async (id) => {
  return await List().del().where('id', id);
};

module.exports.addBirdToList = async (listId, opts = {}) => {
  await ListBird().insert({
    bird_id: opts.birdId,
    list_id: listId,
    local_name: opts.localName,
    sort: opts.sort
  }, ['bird_id', 'list_id']);
};

module.exports.removeBirdFromList = async (listId, birdId) => {
  return await ListBird().del().where('list_id', listId).andWhere('bird_id', birdId);
};
