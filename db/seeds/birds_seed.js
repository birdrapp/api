
exports.seed = async (knex,
  Promise) => {
  // Deletes ALL existing entries


  return Promise.all([
    await knex('birds').del(),
    await knex('birds').insert([
      {
        id: 'robin-robin',
        common_name: 'Robin',
        scientific_name: 'Robin Robin',
        family_name: 'Muscicapidae',
        family: 'Old World flycatchers and chats',
        order: 'Passeriformes',
        alternative_names: '{"European Robin"}'
      },
      {
        id: 'crow-crow',
        common_name: 'Crow',
        scientific_name: 'Crow Crow',
        family_name: 'Muscicapidae',
        family: 'Old World flycatchers and chats',
        order: 'Passeriformes',
        alternative_names: '{"European Robin"}'
      },
      {
        id: 'eagle-eagle',
        common_name: 'Eagle',
        scientific_name: 'Eagle Eagle',
        family_name: 'Muscicapidae',
        family: 'Old World flycatchers and chats',
        order: 'Passeriformes'
      }
    ])
  ]);
};
