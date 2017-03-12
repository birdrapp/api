'use strict';

const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('../db/knex');

const Bird = () => knex('birds');
const rowToBird = (row) => {
  const bird = _.mapKeys(row, (v, k) => changeCase.camel(k));
  bird.subspecies = parseInt(bird.subspecies);
  delete bird.speciesId;
  return bird;
};

module.exports.all = async (opts = {}) => {
  const limit = opts.perPage;
  const page = opts.page;
  const q = opts.query;

  const query = knex.with('subspecies', (qb) => {
    qb.select(knex.raw('coalesce("species_id", "id") as species_id'), knex.raw('count(*) - 1 as subspecies')).from('birds').groupByRaw(1);
  }).select('birds.*', 'subspecies')
    .from('subspecies')
    .join('birds', 'birds.id', 'subspecies.species_id')
    .orderBy('sort');

  const offset = (page - 1) * limit;

  if (q !== undefined) query.where('common_name', 'ilike', `${q}%`);
  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToBird);
};

module.exports.count = async () => {
  const result = await Bird().count('id as count');
  return parseInt(result[0].count);
};

module.exports.find = async (id) => {
  const results = await Promise.all([
    Bird().select('birds.*').where('id', id).first(),
    Bird().count('id').where('species_id', id)
  ]);

  const bird = results[0];
  const subspecies = results[1][0].count;

  if (bird !== undefined) {
    bird.subspecies = subspecies;
    return rowToBird(bird);
  }
};

module.exports.create = async (bird) => {
  const row = _.mapKeys(bird, (v, k) =>
    changeCase.snake(k)
  );

  const ids = await Bird().insert(row, 'id');
  return await module.exports.find(ids[0]);
};

module.exports.delete = async (id) => {
  const deleted = await Bird().del().where('id', id);
  return deleted;
};
