
exports.seed = async (knex, Promise) => {
  // Deletes ALL existing entries
  await knex('bird_list_birds').del()

  // Inserts seed entries
  return await knex('bird_list_birds').insert([
    { bird_list_id: '91b3f4c9-cff0-4147-a68a-65c4962208e0', 'bird_id': '91b3f4c9-cff0-4147-a68a-65c4962208e0', local_name: 'British Robin' },
    { bird_list_id: 'e088ff9e-0695-11e7-9d5b-c7e4ffce9555', 'bird_id': '91b3f4c9-cff0-4147-a68a-65c4962208e0', local_name: 'Australian Robin' },
    { bird_list_id: '91b3f4c9-cff0-4147-a68a-65c4962208e0', 'bird_id': 'e67eb5d8-0695-11e7-9d5b-c70585d538fa' }
  ]);
};
