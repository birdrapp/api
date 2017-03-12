'use strict';

exports.seed = async (knex) => {
  await knex('birds').del();
  await knex('birds').insert([
    {
      id: 'e67eb5d8-0695-11e7-9d5b-c70585d538fa',
      common_name: 'Crow',
      scientific_name: 'Crow Crow',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes',
      sort: 4
    },
    {
      id: '91b3f4c9-cff0-4147-a68a-65c4962208e0',
      common_name: 'Robin',
      scientific_name: 'Robin Robin',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes',
      sort: 1
    },
    {
      id: 'ec56048e-0695-11e7-9d5b-9f01cdc37617',
      common_name: 'Eagle',
      scientific_name: 'Eagle Eagle',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes',
      sort: 2
    },
    {
      id: '73e3f4ba-073b-11e7-916c-9747cb349ce0',
      common_name: 'Eagle',
      scientific_name: 'Eagle Eagle Eagle',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes',
      sort: 3,
      species_id: 'ec56048e-0695-11e7-9d5b-9f01cdc37617'
    },
    {
      id: '15e4dbe4-0750-11e7-8212-7b57fdf1055e',
      common_name: 'Eagle',
      scientific_name: 'Eagle Eagle Beagle',
      family_name: 'Muscicapidae',
      family: 'Old World flycatchers and chats',
      order: 'Passeriformes',
      sort: 5,
      species_id: 'ec56048e-0695-11e7-9d5b-9f01cdc37617'
    }
  ]);
};
