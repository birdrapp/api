'use strict';

exports.seed = async (knex, Promise) => {
  await knex('lists').del();
  await knex('lists').insert([
    {
      id: '91b3f4c9-cff0-4147-a68a-65c4962208e0',
      name: 'The British List',
      description: 'The British List'
    },
    {
      id: 'd74e66d0-0695-11e7-9d5b-6bbd102031a7',
      name: 'Bird Life International List',
      description: 'The Bird Life International list'
    },
    {
      id: 'e088ff9e-0695-11e7-9d5b-c7e4ffce9555',
      name: 'The Australia List',
      description: 'A list of birds in australia'
    }
  ]);

  Promise.resolve();
};
