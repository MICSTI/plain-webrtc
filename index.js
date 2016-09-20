// module imports
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var http = require('http');

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

// use method override
app.use(methodOverride());

// app routes
app.use("/lib", express.static("lib"));
app.use("/build", express.static("build"));
app.use("/", function(req, res, next) {
    res.sendFile(path.resolve('build/views/index.html'));
});

// error handling
app.use(function(err, req, res, next) {
    // log errors
    console.error(err.stack);
    next(err);
});

app.use(function(err, req, res, next) {
    // client error handler
    if (req.xhr) {
        res.status(500).send({
            error: 'Something failed'
        });
    } else {
        next(err);
    }
});

app.use(function(err, req, res, next) {
    // error handler
    res.status(500);
    res.render('error', {
        error: err
    });
});

// server instance
var server = http.Server(app);

// configure Socket.io
var io = require('socket.io')(server);
require('./server/communication')(io);

// start app
server.listen(port);

console.log('Plain WebRTC started on port', port);

// expose app
exports = module.exports = app;