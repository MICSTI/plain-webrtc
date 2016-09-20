'use strict';

var _ = require('lodash');

module.exports = function(io) {
    // clients array
    var clients = [];

    io.on('connection', function(client) {
        // add client to clients array
        clients.push(client);

        console.log('-- ' + client.id + ' joined --');

        function leave() {
            console.log('-- ' + client.id + ' left --');

            _.remove(clients, function(obj) {
                return obj.id === client.id
            });
        };

        client.on('disconnect', leave);
    });
};