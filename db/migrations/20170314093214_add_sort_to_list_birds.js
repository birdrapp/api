'use strict';

exports.up = function (knex) {
  return knex.schema.table('list_birds', (table) => {
    table.integer('sort').notNullable().unique();
  });
};

exports.down = function (knex) {
  return knex.schema.table('list_birds', (table) => {
    table.dropColumn('sort');
  });
};
