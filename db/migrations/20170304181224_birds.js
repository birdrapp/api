'use strict';

exports.up = async (knex) => {
  return await knex.schema.createTable('birds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v1mc()'));
    table.string('common_name').notNullable();
    table.string('scientific_name').notNullable().unique();
    table.string('family_name').notNullable();
    table.string('family').notNullable();
    table.string('order').notNullable();
    table.integer('sort').notNullable().unique().index();
    table.uuid('species_id').references('id').inTable('birds');
    table.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  return await knex.schema.dropTable('birds');
};
