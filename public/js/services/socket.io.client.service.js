'use strict';

angular.module('plain-webrtc')
    .factory('SocketSrv', function($rootScope, LogSrv) {
        var socket = null;
        var users = [];
        var ownId = null;

        var on = function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        };

        var emit = function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;

                $rootScope.$apply(function() {
                    if (callback !== undefined && typeof callback === 'function') {
                        callback.apply(socket, args);
                    }
                });
            });
        };

        var connect = function() {
            // connect to Socket.io server
            socket = io.connect();

            LogSrv.info('Socket connected');

            on('id', function(data) {
                ownId = data;
            });

            on('users.update', function(data) {
                parseUserArray(data);
            });
        };

        var parseUserArray = function(_users) {
            users = _users.filter(function(user) {
                return user.id !== ownId;
            });
        };

        var register = function(username) {
            socket.emit('register', {
                username: username
            });
        };

        return {
            connect: connect,
            register: register,
            getUsers: function() {
                return users;
            }
        };
    });
