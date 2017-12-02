var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var taskRouter = require('./routes/task');
var memberRouter = require('./routes/member');
var config = require('./config/config.json');

var app = express();
var port = 8080;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

//member routes
app.use('/api', memberRouter);
app.use('/api', taskRouter);

app.listen(port, () => {
  console.log('gtc17 running on port ' + port);
});
