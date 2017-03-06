
exports.up = (knex, Promise) => {
  return knex.schema.createTable('birds', (table) => {
    table.string('id').primary();
    table.string('common_name').notNullable();
    table.string('scientific_name').notNullable().unique();
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('birds');
};
