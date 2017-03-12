'use strict';

const cluster = require('cluster');
const logger = require('./lib/logger');
const server = require('./server');
const port = process.env.PORT || 8080;

if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length;

  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  server.listen(port);
  logger.info(`Server listening on ${port}`);
}

cluster.on('exit', (worker) => {
  logger.error('Process %d died', worker.id);
  cluster.fork();
});
