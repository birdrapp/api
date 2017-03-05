
exports.up = function (knex, Promise) {
  return knex.schema.createTable('birds', function (table) {
    table.string('id').primary();
    table.string('common_name').notNullable();
    table.string('scientific_name').notNullable().unique();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('birds');
};
