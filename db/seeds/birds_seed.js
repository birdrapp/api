
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
      id: 'e67eb5d8-0695-11e7-9d5b-c70585d538fa',
      common_name: 'Crow',
      scientific_name: 'Crow Crow',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    },
    {
      id: 'ec56048e-0695-11e7-9d5b-9f01cdc37617',
      common_name: 'Eagle',
      scientific_name: 'Eagle Eagle',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes'
    }
  ]);
};
