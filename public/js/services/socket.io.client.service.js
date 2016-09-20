'use strict';

angular.module('plain-webrtc')
    .factory('SocketSrv', function(LogSrv) {
        var socket = null;

        var connect = function() {
            // connect to Socket.io server
            socket = io.connect();

            LogSrv.info('Socket connected');
        };

        return {
            connect: connect
        };
    });
