#!/usr/bin/env node
"use strict";

const cluster = require('cluster');

if (cluster.isMaster) {
  let workerCount = require('os').cpus().length;

  while (workerCount--) {
    cluster.fork();
  }

  cluster.on('exit', deadWorker => {
    let worker = cluster.fork();

    console.log('worker ' + deadWorker.process.pid + ' replaced by ' +
    worker.process.pid);
  });
} else {
  console.log('Starting worker ' + process.pid);
  require('./web');
}
