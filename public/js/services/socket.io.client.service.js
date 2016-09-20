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

            on('msg', function(data) {
                var topic = data.topic;

                delete data.topic;

                // publish relay message on root scope
                $rootScope.$broadcast(topic, data);
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

        var sendMessage = function(message) {
            socket.emit('msg', message);
        };

        var findUserById = function(id) {
            var user = null;

            users.forEach(function(u) {
                if (u.id === id) {
                    user = u;
                }
            });

            return user;
        };

        return {
            connect: connect,
            register: register,
            findUserById: findUserById,
            sendMessage: sendMessage,
            getUsers: function() {
                return users;
            }
        };
    });
