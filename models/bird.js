const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('../db/knex.js');

function Bird() {
  return knex('birds');
}

function rowToBird(row) {
  return _.mapKeys(row, (v, k) =>
    changeCase.camel(k)
  )
}

module.exports.all = async function () {
  return await Bird().select().map(rowToBird);
};

module.exports.find = async function (id) {
  const bird = await Bird().where('id', id).first();
  if (bird !== undefined) return rowToBird(bird);
};

module.exports.create = async function (bird) {
  let row = _.mapKeys(bird, (v, k) =>
    changeCase.snake(k)
  );

  row.id = changeCase.paramCase(bird.scientificName);

  let ids = await Bird().insert(row, 'id');
  const id = ids[0];
  return await module.exports.find(id);
}

module.exports.delete = async function (id) {
  const deleted = await Bird().del().where('id', id);
  return deleted;
}
