
exports.up = async (knex, Promise) => {
  return await knex.schema.createTable('birds', (table) => {
    table.string('id').primary();
    table.string('common_name').notNullable();
    table.string('scientific_name').notNullable().unique();
    table.string('family_name').notNullable();
    table.string('family').notNullable();
    table.string('order').notNullable();
    table.specificType('alternate_names', 'varchar(255)[]');
    table.timestamps(true, true);
  });
};

exports.down = async (knex, Promise) => {
  return await knex.schema.dropTable('birds');
};
