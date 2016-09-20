'use strict';

angular.module('plain-webrtc')
    .factory('SocketSrv', function(LogSrv) {
        var socket = null;

        var connect = function() {
            // connect to Socket.io server
            socket = io.connect();

            LogSrv.info('Socket connected');
        };

        var register = function(username) {
            socket.emit('register', {
                username: username
            });
        };

        return {
            connect: connect,
            register: register
        };
    });
