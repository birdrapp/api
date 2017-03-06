const config = require('config');
const knex = require('knex')(config.get('database'));
module.exports = knex;
