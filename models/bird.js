'use strict';

const _ = require('lodash');
const changeCase = require('change-case');
const knex = require('../db/knex');

const Bird = () => knex('birds');
const rowToBird = (row) => {
  const bird = _.mapKeys(row, (v, k) => changeCase.camel(k));
  bird.subspecies = parseInt(bird.subspecies);
  return bird;
};

module.exports.all = async (opts = {}) => {
  const limit = opts.perPage;
  const page = opts.page;
  const q = opts.query;
  const scientificName = opts.scientificName;

  const query = Bird().select('birds.*').orderBy('sort');

  const offset = (page - 1) * limit;

  if (q !== undefined) query.where('common_name', 'ilike', `${q}%`);
  if (scientificName !== undefined) query.where('scientific_name', 'ilike', scientificName);
  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToBird);
};

module.exports.count = async () => {
  const result = await Bird().count('id as count').whereNull('species_id');
  return parseInt(result[0].count);
};

module.exports.find = async (id) => {
  const results = await Promise.all([
    Bird().select('birds.*').where('id', id).first(),
    module.exports.countSubspecies(id)
  ]);

  const bird = results[0];
  const subspecies = results[1];

  if (bird !== undefined) {
    bird.subspecies = subspecies;
    return rowToBird(bird);
  }
};

module.exports.subspecies = async (id, opts = {}) => {
  const limit = opts.perPage;
  const page = opts.page;
  const offset = (page - 1) * limit;

  const query = Bird().where('species_id', id);

  if (limit !== undefined) query.limit(limit);
  if (offset !== undefined) query.offset(offset);

  return await query.map(rowToBird);
};

module.exports.countSubspecies = async (id) => {
  const result = await Bird().count('id as count').where('species_id', id);
  return parseInt(result[0].count);
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
