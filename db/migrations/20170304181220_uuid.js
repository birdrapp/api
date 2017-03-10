
exports.up = async (knex, Promise) => {
  return await knex.raw('CREATE EXTENSION "uuid-ossp"');
};

exports.down = async (knex, Promise) => {
  return await knex.raw('DROP EXTENSION "uuid-ossp";');
};
