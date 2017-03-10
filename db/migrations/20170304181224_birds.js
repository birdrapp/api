
exports.up = async (knex, Promise) => {
  return await knex.schema.createTable('birds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v1mc()'));
    table.string('common_name').notNullable();
    table.string('scientific_name').notNullable().unique();
    table.string('family_name').notNullable();
    table.string('family').notNullable();
    table.string('order').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async (knex, Promise) => {
  return await knex.schema.dropTable('birds');
};
