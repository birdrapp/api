
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('birds').del()
    .then(function () {
      // Inserts seed entries
      return knex('birds').insert([
        { id: 'robin-robin', common_name: 'Robin', scientific_name: 'Robin Robin' },
        { id: 'crow-crow', common_name: 'Crow', scientific_name: 'Crow Crow' },
        { id: 'eagle-eagle', common_name: 'Eagle', scientific_name: 'Eagle Eagle' }
      ]);
    });
};
