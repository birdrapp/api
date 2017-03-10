const _ = require('lodash');
const changeCase = require('change-case')
const knex = require('../db/knex');

const BirdList = () => knex('bird_lists');

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

module.exports.count = async () => {
  const result = await BirdList().count('id as count');
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
