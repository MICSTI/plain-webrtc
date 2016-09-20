'use strict';

angular
    .module('plain-webrtc')
    .directive('realTimeVideo', function() {
        return {
            template: '<video class="video"></video>',
            restrict: 'E',
            controller: 'RealTimeVideoController',
            link: function link(scope, element, attrs) {
                var video = element[0].querySelector('video');

                var videoWidth, videoHeight;

                video.autoplay = true;
                video.srcObject = null;

                video.onloadedmetadata = function() {
                    videoWidth = this.videoWidth;
                    videoHeight = this.videoHeight;
                };

                scope.$on('webrtc.connected', function(event, data) {
                    video.srcObject = data.stream;
                });
            }
        }
    });