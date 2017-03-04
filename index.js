const cluster = require('cluster');
const logger = require('./logger');
const server = require('./server');
const port = 7080;

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;

  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  server.listen(port);
  logger.info(`Server listening on ${port}`);
}

cluster.on('exit', function (worker) {
  logger.error('Process %d died', worker.id);
  cluster.fork();
});
