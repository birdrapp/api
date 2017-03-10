
exports.up = async (knex, Promise) => {
  return await knex.schema.createTable('bird_lists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v1mc()'));
    table.string('name').notNullable().unique();
    table.string('description').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async (knex, Promise) => {
  await knex.schema.dropTable('bird_lists');
};
