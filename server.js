var express = require('express');
var morgan = require('morgan')
var bodyParser = require('body-parser');
var memberRouter = require('./routes/member');
var config = require('./config/config.json');

var app = express();
var port = 8080;

app.use(morgan('dev'));
app.use(bodyParser.json());

//member routes
app.use('/api', memberRouter);


app.listen(port, () => {
  console.log('gtc17 running on port ' + port);
});
