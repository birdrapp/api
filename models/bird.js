const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('../db/knex.js');

const Bird = () => knex('birds');
const rowToBird = (row) => {
  let bird = _.mapKeys(row, (v, k) => changeCase.camel(k));
  if (bird.alternativeNames === null) bird.alternativeNames = [];
  return bird;
}

module.exports.all = async (opts) => {
  opts = opts || {};
  const limit = opts.perPage;
  const page = opts.page;

  const offset = (page - 1) * limit;
  const query = Bird().select();

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToBird);
};

module.exports.count = async () => {
  const result = await Bird().count('id as count');
  return parseInt(result[0].count);
}

module.exports.find = async (id) => {
  const bird = await Bird()
    .select('birds.*')
    .where('id', id)
    .first();

  if (bird !== undefined) return rowToBird(bird);
};

module.exports.create = async (bird) => {
  let row = _.mapKeys(bird, (v, k) =>
    changeCase.snake(k)
  );

  row.id = changeCase.paramCase(bird.scientificName);

  const ids = await Bird().insert(row, 'id');
  return await module.exports.find(ids[0]);
}

module.exports.delete = async (id) => {
  const deleted = await Bird().del().where('id', id);
  return deleted;
}
