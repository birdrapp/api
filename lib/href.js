'use strict';

const config = require('config');

module.exports = (path) => {
  return config.get('host') + path;
};
