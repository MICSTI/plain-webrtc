// module imports
var express = require('express');
var bodyParser = require('body-parser');

// config
var serverConfig = require("./config/server");

var port = process.env.PORT || serverConfig.port;

// app instance
var app = express();

// get all data of the body (POST) parameters
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// start app
app.listen(port);

console.log('Plain WebRTC started on port', port);

// expose app
exports = module.exports = app;