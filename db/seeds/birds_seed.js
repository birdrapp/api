
exports.seed = async (knex, Promise) => {
  await knex('birds').del();
  await knex('birds').insert([
    {
      id: '91b3f4c9-cff0-4147-a68a-65c4962208e0',
      common_name: 'Robin',
      scientific_name: 'Robin Robin',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    },
    {
      common_name: 'Crow',
      scientific_name: 'Crow Crow',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    },
    {
      common_name: 'Eagle',
      scientific_name: 'Eagle Eagle',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    }
  ]);
};
