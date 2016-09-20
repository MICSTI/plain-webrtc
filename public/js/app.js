var app = angular.module("plain-webrtc", [
    'ui.router'
]);

// define application constants
app.constant("AppConfig", {
    "log.info": true,
    "log.error": true
});

app.controller("AppCtrl", function($scope, LogSrv, SocketSrv) {
    // ----------- App config ------------

    // ----------- App initialization ------------
    SocketSrv.connect();

    // ----------- Event handling ------------

});