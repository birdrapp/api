'use strict';

exports.up = async (knex) => {
  return await knex.schema.createTable('lists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v1mc()'));
    table.string('name').notNullable().unique();
    table.string('description').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('lists');
};
