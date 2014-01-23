#!/usr/bin/env node
/*jshint node:true */

"use strict";

var cluster = require('cluster');

if (cluster.isMaster) {
    var workerCount = require('os').cpus().length;

    while (workerCount--) {
        cluster.fork();
    }

    cluster.on('exit', function (deadWorker) {
        var worker = cluster.fork();

        console.log('worker ' + deadWorker.process.pid + ' replaced by ' +
            worker.process.pid);
    });
} else {
    console.log('Starting worker ' + process.pid);
    require('./web');
}
