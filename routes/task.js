var path = require("path");
var shell = require('shelljs');
var express = require('express');
var exec = require('child_process').exec;
var taskRouter = express.Router();

taskRouter.get('/export', function(req, res, next) {
  shell.exec('./tasks/logstash/bin/logstash -f testPipe.conf');
  res.json({ status: "success" });
});

module.exports = taskRouter;