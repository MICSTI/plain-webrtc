'use strict';

var _ = require('lodash');

module.exports = function(io) {
    // clients array
    var clients = [];

    var setClientInfo = function(id, property, value) {
        var c = _.find(clients, function(_client) {
            return _client.id === id;
        });

        if (c) {
            c[property] = value;
        }
    };

    io.on('connection', function(client) {
        // add client to clients array
        clients.push(client);

        console.log('-- ' + client.id + ' joined --');

        client.on('register', function(data) {
            setClientInfo(client.id, 'username', data.username);

            console.log('--- ' + client.id + ' registered as ' + client.username + ' ---');
        });

        function leave() {
            console.log('-- ' + client.id + ' left --');

            _.remove(clients, function(obj) {
                return obj.id === client.id
            });
        };

        client.on('disconnect', leave);
    });
};