var app = angular.module("plain-webrtc", [
    'ui.router',
    'ngMessages'
]);

// define application constants
app.constant("AppConfig", {
    "log.info": true,
    "log.error": true
});

app.controller("AppCtrl", function($scope, LogSrv, SocketSrv, FocusSrv) {
    // ----------- App config ------------
    var user = {
        username: null
    };

    var remotePeer = null;
    var uiMessage = null;

    var callUser = function(_remotePeer) {
        remotePeer = _remotePeer;

        // send call message to remote peer
        SocketSrv.sendMessage({
            to: remotePeer.id,
            topic: 'call.offer',
            payload: {

            }
        });

        // set UI message
        uiMessage = 'call.outgoing';
    };

    var withdrawCall = function() {
        // send socket message
        SocketSrv.sendMessage({
            to: remotePeer.id,
            topic: 'call.withdrawn',
            payload: {

            }
        });

        // reset remote peer
        remotePeer = null;

        // set UI message
        uiMessage = null;
    };

    var rejectCall = function() {
        // send socket message
        SocketSrv.sendMessage({
            to: remotePeer.id,
            topic: 'call.rejected',
            payload: {

            }
        });

        // reset remote peer
        remotePeer = null;

        // set UI message
        uiMessage = null;
    };

    var acceptCall = function() {
        // send socket message
        SocketSrv.sendMessage({
            to: remotePeer.id,
            topic: 'call.accepted',
            payload: {

            }
        });

        // set UI message
        uiMessage = 'call.accepted';
    };

    // ----------- App initialization ------------
    SocketSrv.connect();

    // ----------- Scope methods ------------
    $scope.isLoggedIn = function() {
        return user.username !== null;
    };

    $scope.userObj = {};

    $scope.login = function(isValid) {
        if (isValid) {
            user.username = $scope.userObj.username;
            LogSrv.info(user);

            // register username with socket service
            SocketSrv.register(user.username);
        } else {
            LogSrv.error('Form not valid');
        }
    };

    $scope.user = function() {
        return user;
    };

    $scope.peers = function() {
        return SocketSrv.getUsers();
    };

    $scope.getInfoMessage = function() {
        return uiMessage;
    };

    $scope.getRemotePeer = function() {
        return remotePeer;
    };

    $scope.callUser = callUser;
    $scope.withdrawCall = withdrawCall;
    $scope.rejectCall = rejectCall;
    $scope.acceptCall = acceptCall;

    FocusSrv('username');


    // ----------- Event handling ------------
    $scope.$on('call.offer', function(event, data) {
        // look up user
        remotePeer = SocketSrv.findUserById(data.from);

        // set ui message
        uiMessage = 'call.incoming';
    });

    $scope.$on('call.withdrawn', function(event, data) {
        // reset remote peer
        remotePeer = null;

        // set ui message
        uiMessage = null;
    });

    $scope.$on('call.rejected', function(event, data) {
        // reset remote peer
        remotePeer = null;

        // set ui message
        uiMessage = null;
    });

    $scope.$on('call.accepted', function(event, data) {
        // set ui message
        uiMessage = 'call.accepted';
    });
});