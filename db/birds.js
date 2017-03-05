const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('./knex.js');

function Birds() {
  return knex('birds');
}

function rowToBird(row) {
  return _.mapKeys(row, (v, k) =>
    changeCase.camel(k)
  )
}

module.exports.all = async function () {
  return await Birds().select().map(rowToBird);
};

module.exports.find = async function (id) {
  const bird = await Birds().where('id', id).first();
  if (bird !== undefined) return rowToBird(bird);
};

module.exports.create = async function (bird) {
  let row = _.mapKeys(bird, (v, k) =>
    changeCase.snake(k)
  );

  row.id = changeCase.paramCase(bird.scientificName);

  let ids = await Birds().insert(row, 'id');
  const id = ids[0];
  return await module.exports.find(id);
}

module.exports.delete = async function (id) {
  const deleted = await Birds().del().where('id', id);
  return deleted;
}
