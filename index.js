const cluster = require('cluster');

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;

  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  const server = require('./server');
  const port = 7080;
  server.listen(port);
  console.log(`Server listening on ${port}`);
}

cluster.on('exit', function (worker) {
  // Replace the dead worker,
  // we're not sentimental
  console.log('Process %d died', worker.id);
  cluster.fork();
});
