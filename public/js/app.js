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
    }

    FocusSrv('username');

    // ----------- Event handling ------------

});