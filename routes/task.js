var path = require("path");
var shell = require('shelljs');
var express = require('express');
var exec = require('child_process').exec;
var elasticsearch = require('elasticsearch');
var taskRouter = express.Router();

const esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'error'
})

taskRouter.get('/export', function(req, res, next) {
  shell.exec('./tasks/logstash/bin/logstash -f testPipe.conf');
  res.json({ status: "success" });
});

taskRouter.get('/elastic', function(req, res, next) {
  esClient.search({
    index: "member",
    size: 1000,
    body: {
      query: {
        match_all: {}
      }
    }
  }).then(results => {
    res.json(results.hits.hits);
  });
});

module.exports = taskRouter;