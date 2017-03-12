
exports.up = async (knex) => {
  return await knex.raw('CREATE EXTENSION "uuid-ossp"');
};

exports.down = async (knex) => {
  return await knex.raw('DROP EXTENSION "uuid-ossp";');
};
