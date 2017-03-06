const winston = require('winston');
let logger;

if (process.env.NODE_ENV !== 'test') {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        colorize: true,
        timestamp: true,
      })
    ]
  });
} else {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ filename: '/dev/null' })
    ]
  });
}

module.exports = logger;
