import io from 'socket.io-client';
import adapter from 'webrtc-adapter';

import {
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  staticPaste,
  bounce
} from './components/funcStore';

document.addEventListener("DOMContentLoaded", function(event) {
  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
  peer,
  chattersClient = [],
  chatterThisClient,
  roomID,
  // variables for video, peerCanvas, and context logic

  peerCanvas,
  peerContext,
  myCanvas,
  myVidCtx,
  myContext,
  peerVidCtx,
  peerVirtualVid,
  // variables for filter logic
  current = document.getElementById('filterDisp'),
  button = document.getElementById('filter'),
  filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', ''],
  i = 0,
  // clear canvas
  clearButton = document.getElementById('clear'),
  // animation variables
  staticButton = document.getElementById('static'),
  bounceButton = document.getElementById('bounce'),
  orbitButton = document.getElementById('orbit'),
  currentAnimation = bounce,
  temp,

  // room buttons
  joinButton = document.getElementById('join-button'),

  // raf stands for requestAnimationFrame, enables drawing to occur
  raf,

  // video / audio configuration
  sdpConstraints = {
    'mandatory': {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    }
  },

  //draw local vid on canvas//
  myVideo = document.getElementById('myVideo'),
  peerVideo = document.getElementById('peerVideo'),

  //peerConnection and other webRTC setup
  peerConn,
  isChannelReady = false,
  isInitiator = false,
  isStarted = false,
  localStream,
  remoteStream,
  turnReady,
  dataChannel,

  //stun server to use
  pcConfig = {
    'iceServers': [{
      'url': 'stun:stun.l.google.com:19302'
    }]
  };

  //image assignment, we can abstract this later
  let emoImg;
  let currentImg = 'assets/emojione/small/1f436.png';

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  //end vendor media objects//


  //room selection
  joinButton.addEventListener('click', function() {
      const socket = io();
      roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomID));
      // socket.on('tryAgain', (payload) => alert('Try a different room!'))

      socket.on('process', (payload) => {
          payload = JSON.parse(payload);
          if (!payload) {
            alert('Try a different room!')
          } else {

            document.getElementById('roomApp').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');

            //begin streaming!//
            navigator.getMedia({
                  video: true,
                  audio: false
                }, function(stream){

                  //make initiate event happen automatically when streaming begins
                  socket.emit('initiate', JSON.stringify({
                    streamId: stream.id,
                    roomId: roomID
                  }))

                  socket.on('readyConnect', (payload) => {
                    document.getElementById('connect').disabled = false;
                  })

                  socket.on('initiated', (member) => {
                      member = JSON.parse(member);

                      myVideo.src = window.URL.createObjectURL(stream);
                      myVideo.play();
                      localStream = stream;

                      //draw local overlay canvas//
                      myCanvas = document.getElementById('myCanvas')
                      myContext = myCanvas.getContext('2d');

                      //width and height should eventually be translated to exact coordination
                      //with incoming video stream
                      myCanvas.width = 640;
                      myCanvas.height = 480;

                      //draws blank canvas on top of video
                      myContext.rect(0, 0, myCanvas.width, myCanvas.height);
                      myContext.stroke();
                      //end//

                      //set room ID shared between clients
                      roomID = member.roomId;

                      if (chattersClient.filter(clientChatter => clientChatter.id !== member.id).length || !chattersClient.length) {
                        chattersClient.push(member);
                        chatterThisClient = member.id;
                      }

                      socket.on('updateChatters', (chatter) => {
                        chattersClient.splice(chattersClient.indexOf(chatter), 1);
                        document.getElementById('connect').disabled = false;
                      });

                      //instantiate peer object
                      document.getElementById('connect').addEventListener('click', function() {
                        maybeStart();
                        //data channel creation
                        console.log('init creating data channel')
                        dataChannel = peerConn.createDataChannel('interact');
                        console.log(dataChannel)
                        onDataChannelCreated(dataChannel)
                        //audio/ video creation
                        doCall();






                      });

                      socket.on('message', function(message) {
                        console.log("Client received Message", message);
                        if (message.type === 'offer') {
                          if (!isStarted){
                            maybeStart();
                            otherDataChannel();
                          }

                          peerConn.setRemoteDescription(new RTCSessionDescription(message));
                          doAnswer();
                        } else if (message.type === 'answer' && isStarted) {
                          console.log('Got answer');
                          peerConn.setRemoteDescription(new RTCSessionDescription(message));
                        } else if (message.type === 'candidate' && isStarted) {
                          let candidate = new RTCIceCandidate({
                            sdpMLineIndex: message.label,
                            candidate: message.candidate
                          });
                          peerConn.addIceCandidate(candidate);
                        }
                      });

                    }); //end of socket.on('initiated')




                    function maybeStart() {
                      console.log('maybestart? ', isStarted, localStream);
                      if (!isStarted && typeof localStream !== 'undefined') {
                        console.log('creating peer connection')
                        createPeerConnection();
                        peerConn.addStream(localStream);
                        isStarted = true;
                      }
                    }

                    function createPeerConnection() {
                      try {
                        peerConn = new RTCPeerConnection (pcConfig)
                        peerConn.onicecandidate = handleIceCandidate;
                        peerConn.onaddstream = handleRemoteStreamAdded;
                        peerConn.onremovestream = handleRemoteStreamRemoved;
                      } catch(err) {
                        console.log('Failed to connect. Error: ' + err);
                      }
                    } //end createPeerConnection


                    //data channel

                    function onDataChannelCreated(channel) {

                      channel.onopen = function() {
                        console.log('data channel opened')
                      };
                      channel.onmessage = event => {
                        console.log(event.data)
                      }
                    }

                    function otherDataChannel(event) {
                      peerConn.ondatachannel = (event) => {
                        console.log('not initiator data channel start', event.channel);
                        dataChannel = event.channel;
                        onDataChannelCreated(dataChannel);
                      }
                    }

                    //misc webRTC helper functions

                    function sendMessage(data, who) {
                        let message = {
                          roomID: roomID,
                          who: who,
                          data: data
                        }
                        console.log('Client Sending Message: ', message);
                        socket.emit('message', message);
                    }

                    function handleIceCandidate(event) {
                      console.log('icecandidate event ', event);
                      if (event.candidate) {
                        sendMessage({
                          type: 'candidate',
                          label: event.candidate.sdpMLineIndex,
                          id: event.candidate.sdpMid,
                          candidate: event.candidate.candidate
                        }, 'other');
                      } else {
                        console.log('End of candidates.');
                      }
                    }

                    function handleRemoteStreamAdded(event) {
                      console.log('Remote Stream Added, event: ', event);
                      remoteStream = event.stream;
                      console.log('local',localStream,'remote',remoteStream)
                      peerVideo = document.getElementById('peerVideo');
                      peerVideo.src = vendorUrl.createObjectURL(event.stream);
                      peerVideo.play();

                      peerCanvas = document.getElementById('peerCanvas')
                      peerContext = peerCanvas.getContext('2d');

                      //width and height should eventually be translated to exact coordination
                      //with incoming video stream
                      peerCanvas.width = 640;
                      peerCanvas.height = 460;

                      //draws blank canvas on top of video, visibility may be unnecessary
                      peerContext.rect(0, 0, peerCanvas.width, peerCanvas.height);
                      peerContext.stroke();
                    }

                    function handleRemoteStreamRemoved(event) {
                      console.log('Remote Stream removed, event: ', event);
                    }

                    function doCall() {
                      console.log('sending offer to peer');
                      peerConn.createOffer(setLocalAndSendMessage, (err) => {
                        console.log('create offer error: ' + err);
                      });
                    }

                    function doAnswer() {
                      console.log('Sending answer to peer.');
                      peerConn.createAnswer().then(
                        setLocalAndSendMessage,
                        (err) => {
                          console.log('create offer error: ' + err);
                        }
                      );
                    }

                    function setLocalAndSendMessage(sessionDescription) {
                      peerConn.setLocalDescription(sessionDescription);
                      console.log('setLocalAndSendMessage. Sending Message', sessionDescription);
                      sendMessage(sessionDescription, 'other');
                    }//close misc webRTC helper function


                    //looks for click event on the send button//
                    document.getElementById('send').addEventListener('click', function() {
                        //creates a message object with a stringified object containing the local port and the message
                        let yourMessageObj = JSON.stringify({
                          message: document.getElementById('yourMessage').value
                        });
                        //creates a variable with the same information to display on your side
                        //peer.localPort is a temporary way to identify peers, should be changed
                        let yourMessage = document.getElementById('yourMessage').value;
                        //post message in text context on your side
                        document.getElementById('messages').textContent += yourMessage + '\n';
                        //send message object to the data channel
                        dataChannel.send(yourMessageObj);
                      })
                      //end send click event//



                }, //end of stream//
                function(err) {
                  console.error(err);
                });
          } //end of boolean in socket 'process' event

      }); //end of socket 'process' event

  }); //end of 'join' event



});
