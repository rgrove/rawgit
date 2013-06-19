#!/usr/bin/env node

/*jshint node:true */
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Start the workers
  for (var i = numCPUs; i >= 0; i--) {
    cluster.fork();
  }

  cluster.on('exit', function(deadWorker) {
    // revive
    var worker = cluster.fork();

    // log the dead worker
    console.log('worker ' + deadWorker.process.pid + ' replaced by ' + worker.process.pid);
  });
} else {
  console.log('Starting worker ' + process.pid);
  require('./web');
}
