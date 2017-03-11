const _ = require('lodash');
const changeCase = require('change-case')
const knex = require('../db/knex');

const BirdList = () => knex('lists');
const BirdListBird = () => knex('list_birds');
const Bird = () => knex('birds');

const rowToBirdList = (row) => {
  if (row === undefined) return;

  return _.mapKeys(row, (v, k) => changeCase.camel(k));
}

module.exports.all = async (opts = {}) => {
  const limit = opts.perPage;
  const offset = (opts.page - 1) * limit;

  const query = BirdList().select().orderBy('name');

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToBirdList);
};

module.exports.birds = async (birdListId, opts = {}) => {
  const limit = opts.perPage;
  const offset = (opts.page - 1) * limit;

  const query = BirdListBird()
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
    .where('list_id', birdListId);

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return query.map(rowToBirdList);
}

module.exports.count = async () => {
  const result = await BirdList().count('id as count');
  return parseInt(result[0].count);
}

module.exports.countBirds = async (id) => {
  const result = await BirdListBird().where('list_id', id).count('bird_id');
  return parseInt(result[0].count);
}

module.exports.find = async (id) => {
  return rowToBirdList(await BirdList()
    .select()
    .where('id', id)
    .first());
}

module.exports.create = async (list) => {
  const ids = await BirdList().insert(list, 'id');
  return await module.exports.find(ids[0]);
}

module.exports.delete = async (id) => {
  return await BirdList().del().where('id', id);
}
