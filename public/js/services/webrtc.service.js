'use strict';

angular.module('plain-webrtc')
    .factory('WebRTCSrv', function($rootScope, LogSrv, SocketSrv) {
        var localStream = null;
        var remoteStream = null;
        var peerConnection = null;

        var remotePeer = null;

        // Service configuration
        var config = {
            peerConnectionConfig: {
                // default ICE server configuration, will be overwritten by XIRSYS API response
                iceServers: [
                    {"urls": ["stun:23.21.150.121"]},
                    {"urls": ["stun:stun.l.google.com:19302"]},
                    {"urls": ["turn:numb.viagenie.ca?transport=udp"], "username": "michael.stifter@evolaris.net", "credential": "15uFbuCxazKrMzog2WnM"},
                    {"urls": ["turn:numb.viagenie.ca?transport=tcp"], "username": "michael.stifter@evolaris.net", "credential": "15uFbuCxazKrMzog2WnM"}
                ]
            },
            peerConnectionConstraints: {
                optional: [
                    {"DtlsSrtpKeyAgreement": true}
                ]
            },
            userMediaConstraints: {
                audio: true,
                video: {
                    width: 480,
                    height: 360
                }
            }
        };

        var init = function() {
            peerConnection = new RTCPeerConnection(config.peerConnectionConfig, config.peerConnectionConstraints);

            LogSrv.info("--- peer connection created ---", config.peerConnectionConfig, config.peerConnectionConstraints);

            peerConnection.addStream(localStream);
            LogSrv.info('--- local stream added ---');

            peerConnection.onaddstream = handleRemoteStreamAdded;
            peerConnection.onremovestream = handleRemoteStreamRemoved;
            peerConnection.oniceconnectionstatechange = handleIceConnectionStateChange;

            peerConnection.onicecandidate = function(event) {
                if (event.candidate) {
                    SocketSrv.sendMessage({
                        to: remotePeer.id,
                        topic: 'webrtc.candidate',
                        payload: {
                            label: event.candidate.sdpMLineIndex,
                            id: event.candidate.sdpMid,
                            candidate: event.candidate.candidate
                        }
                    });
                }
            };

            peerConnection.ondatachannel = function(event) {
                LogSrv.info('--- data channel received ---', event.channel);
            }
        };

        var offer = function() {
            LogSrv.info('--- creating offer ---');

            peerConnection.createOffer()
                .then(function(sessionDescription) {
                    peerConnection.setLocalDescription(sessionDescription);

                    SocketSrv.sendMessage({
                        to: remotePeer.id,
                        topic: 'webrtc.offer',
                        payload: sessionDescription
                    });
                })
                .catch(function(err) {
                   LogSrv.error('Failed to create offer', err);
                });
        };

        var answer = function() {
            LogSrv.info('--- creating answer ---');

            peerConnection.createAnswer()
                .then(function(sessionDescription) {
                    peerConnection.setLocalDescription(sessionDescription);

                    SocketSrv.sendMessage({
                        to: remotePeer.id,
                        topic: 'webrtc.answer',
                        payload: sessionDescription
                    });
                })
                .catch(function(err) {
                    LogSrv.error('failed to set local description', err);
                });
        };

        var handleRemoteStreamAdded = function(event) {
            LogSrv.info("--- remote stream added ---");

            event.stream.getTracks().forEach(function(track) {
                LogSrv.info("REMOTE STREAM TRACK", track);
            });

            // save remote stream reference
            remoteStream = event.stream;
        };

        var handleRemoteStreamRemoved = function(event) {
            LogSrv.info("--- remote stream removed ---");
        };

        var handleIceConnectionStateChange = function(event) {
            var state = (event.srcElement || event.target).iceConnectionState;  // because of differences between Chrome and Firefox

            switch (state) {
                case 'connected':
                    LogSrv.info('--- connected ---');

                    $rootScope.$broadcast('webrtc.connected', {
                        stream: remoteStream
                    });

                    break;

                case 'closed':
                    LogSrv.info('--- closed ---');

                    $rootScope.$broadcast('webrtc.disconnected');

                    break;

                case 'disconnected':
                    LogSrv.info('--- disconnected ---');

                    $rootScope.$broadcast('webrtc.disconnected');

                    closeWebRTCConnection();

                    break;

                case 'failed':
                    LogSrv.error('--- failed ---', event);

                    // release media access (returns a promise)
                    releaseMediaAccess();

                    break;

                default:
                    LogSrv.info('--- ICE connection state change ---', state);
            }
        };

        var requestMediaAccess = function(options) {
            return new Promise(function(resolve, reject) {
                navigator
                    .mediaDevices
                    .getUserMedia(config.userMediaConstraints)
                    .then(function(mediaStream) {
                        localStream = mediaStream;

                        LogSrv.info("--- got media access ---", config.userMediaConstraints);

                        resolve(localStream);
                    })
                    .catch(function(err) {
                        LogSrv.error('Failed to obtain media access for options', config.userMediaConstraints, err);
                        reject(err);
                    });
            });
        };

        var releaseMediaAccess = function() {
            return new Promise(function(resolve, reject) {
                // resolve promise immediately if media access has already been released
                if (localStream === null) {
                    resolve();
                }

                var tracks = localStream.getTracks();

                tracks.forEach(function(track) {
                    track.stop();
                });

                localStream = null;

                resolve();
            });
        };

        var establishConnection = function(options) {
            requestMediaAccess()
                .then(function() {
                    // send init message to remote peer
                    SocketSrv.sendMessage({
                        to: remotePeer.id,
                        topic: 'webrtc.init',
                        payload: {

                        }
                    });

                    // init peer connection
                    init();
                })
                .catch(function(err) {

                });
        };

        var hangup = function() {
            if (peerConnection !== null) {
                peerConnection.close();
            }

            peerConnection = null;

            localStream = null;
            remoteStream = null;
        };

        var closeWebRTCConnection = function() {
            if (peerConnection !== null) {
                LogSrv.info('--- closing WebRTC connection ---');

                releaseMediaAccess()
                    .then(function() {
                        hangup();

                        setRemotePeer(null);
                    });
            }
        };

        var setRemotePeer = function(peer) {
            remotePeer = peer;
        };

        var isConnected = function() {
            return peerConnection !== null;
        };

        $rootScope.$on('webrtc.init', function(event, data) {
            LogSrv.info('--- received WebRTC init ---');

            requestMediaAccess()
                .then(function() {
                    // init peer connection
                    init();

                    // send session description offer
                    offer();
                })
                .catch(function(err) {

                });
        });

        $rootScope.$on('webrtc.offer', function(event, data) {
            LogSrv.info('--- received offer ---', data);

            peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload))
                .then(function() {
                    LogSrv.info('--- set remote description ---');

                    // send answer
                    answer();
                })
                .catch(function(err) {
                    LogSrv.error('failed to set remote description', err);
                });
        });

        $rootScope.$on('webrtc.answer', function(event, data) {
            LogSrv.info('--- received answer ---', data);

            peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload))
                .then(function() {
                    LogSrv.info('--- set remote description ---');
                })
                .catch(function(err) {
                    LogSrv.error('failed to set remote description', err);
                });
        });

        $rootScope.$on('webrtc.candidate', function(event, data) {
            if (peerConnection.remoteDescription) {
                peerConnection.addIceCandidate(new RTCIceCandidate(data.payload))
                    .then(function() {
                        LogSrv.info('--- added ICE candidate ---');
                    })
                    .catch(function(err) {
                        LogSrv.error('failed to add ICE candidate', err);
                    });
            }
        });

        return {
            init: init,
            establishConnection: establishConnection,
            closeConnection: closeWebRTCConnection,
            setRemotePeer: setRemotePeer,
            isConnected: isConnected
        };
    });
