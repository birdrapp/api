
exports.seed = async (knex, Promise) => {
  await knex('bird_lists').del();
  await knex('bird_lists').insert([
    {
      id: '91b3f4c9-cff0-4147-a68a-65c4962208e0',
      name: 'The British List',
      description: 'The British List'
    },
    {
      name: 'Bird Life International List',
      description: 'The Bird Life International list'
    },
    {
      name: 'The Australia List',
      description: 'A list of birds in australia'
    }
  ]);

  Promise.resolve();
};
