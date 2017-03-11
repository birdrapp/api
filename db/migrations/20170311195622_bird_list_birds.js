
exports.up = async (knex, Promise) => {
  return await knex.schema.createTable('bird_list_birds', (table) => {
    table.uuid('bird_list_id').notNullable();
    table.uuid('bird_id').notNullable();
    table.unique(['bird_list_id', 'bird_id']);
    table.string('local_name');
    table.timestamps(true, true);
  });
};

exports.down = async (knex, Promise) => {
  await knex.schema.dropTable('bird_list_birds');
};
