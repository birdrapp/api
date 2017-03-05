
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('birds', function (t) {
    t.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('birds', function (t) {
    t.dropTimestamps();
  });
};
