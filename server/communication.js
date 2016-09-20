'use strict';

module.exports = function(io) {
    // clients array
    var clients = [];

    io.on('connection', function(client) {
        // add client to clients array
        clients.push(client);

        console.log('-- ' + client.id + ' joined --');
    });
};