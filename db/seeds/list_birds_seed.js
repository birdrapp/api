'use strict';

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('list_birds').del();

  // Inserts seed entries
  return await knex('list_birds').insert([
    { list_id: '91b3f4c9-cff0-4147-a68a-65c4962208e0', 'bird_id': '91b3f4c9-cff0-4147-a68a-65c4962208e0', local_name: 'British Robin', sort: 3 },
    { list_id: 'e088ff9e-0695-11e7-9d5b-c7e4ffce9555', 'bird_id': '91b3f4c9-cff0-4147-a68a-65c4962208e0', local_name: 'Australian Robin', sort: 2 },
    { list_id: '91b3f4c9-cff0-4147-a68a-65c4962208e0', 'bird_id': 'e67eb5d8-0695-11e7-9d5b-c70585d538fa', sort: 1 }
  ]);
};
