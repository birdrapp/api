exports.up = async (knex, Promise) => {
  return await Promise.all([
    knex.schema.alterTable('birds', (table) => {
      table.string('family_name').notNullable();
      table.string('family').notNullable();
      table.string('order').notNullable();
    })
  ]);
};

exports.down = async (knex, Promise) => {
  return Promise.all([
    await knex.schema.alterTable('birds', (table) => {
      table.dropColumn('family_name');
      table.dropColumn('family');
      table.dropColumn('order');
    })
  ]);
};
