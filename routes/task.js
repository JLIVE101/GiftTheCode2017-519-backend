var path = require("path");
var env = require('dotenv');
var shell = require('shelljs');
var express = require('express');
var exec = require('child_process').exec;
var taskRouter = express.Router();

taskRouter.get('/export', async function(req, res, next) {
  await shell.exec('./tasks/logstash-6.0.0/bin/logstash -f ./tasks/logstash-6.0.0/export.conf');
  res.sendFile(process.env.OUTPUT_PATH);
});

module.exports = taskRouter;