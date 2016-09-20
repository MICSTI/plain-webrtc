var app = angular.module("plain-webrtc", [
    'ui.router'
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
        } else {
            LogSrv.error('Form not valid');
        }
    };

    FocusSrv('username');

    // ----------- Event handling ------------

});