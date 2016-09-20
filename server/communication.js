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

    var getAllClients = function() {
        return clients
            .filter(function(c) {
                return c.username !== undefined;
            })
            .map(function(c) {
                return {
                    id: c.id,
                    username: c.username,
                    status: c.status
                }
            });
    };

    var broadcastUserUpdate = function(client) {
        // broadcast to everyone except ourselves
        io.sockets.emit('users.update', getAllClients());
    };

    io.on('connection', function(client) {
        // add client to clients array
        clients.push(client);

        client.on('register', function(data) {
            setClientInfo(client.id, 'username', data.username);
            setClientInfo(client.id, 'status', 'free');

            console.log('--- ' + client.id + ' registered as ' + client.username + ' ---');

            broadcastUserUpdate(client);
        });

        client.on('disconnect', function() {
            console.log('-- ' + client.id + ' left --');

            _.remove(clients, function(obj) {
                return obj.id === client.id;
            });

            broadcastUserUpdate(client);
        });

        // send socket id back to client
        client.emit('id', client.id);

        console.log('-- ' + client.id + ' joined --');
    });
};