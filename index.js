import adapter from 'webrtc-adapter';
import io from 'socket.io-client';
import {
  filterListener,
  animationListener
} from './components/listenerFuncs';
import {
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  paste,
  bounce
} from './components/funcStore';
import {
  mediaGenerator
} from './components/mediaGenerator';
import {
  roomStore,
  filterStore,
  mediaStore,
  animeStore,
  rtcStore
} from './components/mirageStore';

document.addEventListener("DOMContentLoaded", (event) => {


  //states//
  let roomState = roomStore(window.URL);
  let mediaState = mediaStore();
  let filterState = filterStore(document.getElementById('filterDisp'), document.getElementById('filter'));

  let animeState = animeStore(document.getElementById('animation'), document.getElementById('animateDisp'), document.getElementsByClassName('emoji'));


  let rtcState = rtcStore();

  // clear canvas
  let clearButton = document.getElementById('clear');
  // room buttons
  let joinButton = document.getElementById('join-button');
  //turn server to use
  //if (location.hostname != 'localhost') {
  //  requestTurn(
  //    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  //  );
  //}

  // vendor media objects//
  navigator.getMedia = navigator.mediaDevices.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia; //end vendor media objects//

  //room selection

  joinButton.addEventListener('click', () => {
      const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/')
      roomState.roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomState.roomID));

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
            }).then(stream => {

                //make initiate event happen automatically when streaming begins
                socket.emit('initiate', JSON.stringify({
                  streamId: stream.id,
                  roomId: roomState.roomID
                }))

                socket.on('readyConnect', (payload) => {
                  document.getElementById('connect').disabled = false;
                })


                socket.on('initiated', (member) => {

                  member = JSON.parse(member);

                  mediaState.myMedia = mediaGenerator(stream, roomState.vendorUrl, 'myBooth', 'myVideo', 'myCanvas', 533, 400);

                  mediaState.myVideo = mediaState.myMedia.video;
                  mediaState.myCanvas = mediaState.myMedia.canvas;
                  mediaState.myContext = mediaState.myMedia.context;

                  //sets up local stream reference
                  rtcState.localStream = stream;
                  //set room ID shared between clients
                  roomState.roomID = member.roomId;

                  if (roomState.chattersClient.filter(clientChatter => clientChatter.id !== member.id).length || !roomState.chattersClient.length) {
                    roomState.chattersClient.push(member);
                    roomState.chatterThisClient = member.id;
                  }

                  //instantiate peer objects and finish signaling for webRTC data and video channels
                  document.getElementById('connect').addEventListener('click', function() {
                    startSetup();
                    //data channel creation
                    console.log('init creating data channel')
                      //create data channel
                    rtcState.dataChannel = rtcState.peerConn.createDataChannel('interact');
                    // console.log(dataChannel)
                    onDataChannelCreated(rtcState.dataChannel)
                      //audio/ video creation
                    doCall();
                  });

                  socket.on('message', function(message) {
                    console.log("Client received Message", message);
                    if (message.type === 'offer') {
                      if (!rtcState.isStarted) {
                        startSetup();
                        otherDataChannel();
                      }

                      rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                      doAnswer();
                    } else if (message.type === 'answer' && rtcState.isStarted) {
                      console.log('Got answer');
                      rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                    } else if (message.type === 'candidate' && rtcState.isStarted) {
                      let candidate = new RTCIceCandidate({
                        sdpMLineIndex: message.label,
                        candidate: message.candidate
                      });
                      rtcState.peerConn.addIceCandidate(candidate);
                    }
                  });

                }); //end of socket.on('initiated')


                function startSetup() {
                  console.log('startSetup? ', rtcState.isStarted, rtcState.localStream);
                  if (!rtcState.isStarted && typeof rtcState.localStream !== 'undefined') {
                    console.log('creating peer connection')
                    createPeerConnection();
                    rtcState.peerConn.addStream(rtcState.localStream);
                    rtcState.isStarted = true;
                  }
                }

                function createPeerConnection() {
                  try {
                    rtcState.peerConn = new RTCPeerConnection(rtcState.pcConfig)
                    rtcState.peerConn.onicecandidate = handleIceCandidate;
                    rtcState.peerConn.onaddstream = handleRemoteStreamAdded;
                    rtcState.peerConn.onremovestream = handleRemoteStreamRemoved;

                  } catch (err) {
                    console.log('Failed to connect. Error: ' + err);
                    return;
                  }
                }

                //data channel stuff
                function onDataChannelCreated(channel) {

                  channel.onopen = function() {
                    console.log('data channel opened');
                  };

                  //after creation of data channel switch button visilibity
                  document.getElementById('connect').disabled = true;
                  document.getElementById('disconnect').disabled = false;

                  //beginning of interactivity
                  //looks for click event on the send button//
                  document.getElementById('send').addEventListener('click', function() {
                      //post message in text context on your side
                      //send message object to the data channel
                      console.log(peerConn);
                      let yourMessageObj = JSON.stringify({
                        message: "them:" + " " + document.getElementById('yourMessage').value
                      });
                      //creates a variable with the same information to display on your side
                      //peer.localPort is a temporary way to identify peers, should be changed
                      let yourMessage = "me:" + " " + document.getElementById('yourMessage').value;
                      //post message in text context on your side
                      document.getElementById('messages').textContent += yourMessage + '\n';
                      rtcState.dataChannel.send(yourMessageObj);
                    }) //end send click event//

                  //click event for the "filter me" button//
                  filterListener(mediaState.myVideo, 'myFilter', mediaState.currFilter, true, rtcState.dataChannel, setVendorCss);
                  //click event for the "filter them" button
                  filterListener(mediaState.peerVideo, 'peerFilter', mediaState.currFilter, false, rtcState.dataChannel, setVendorCss);

                  animationListener(mediaState.myCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.myContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, true, getCursorPosition); //local

                  //changing filters//
                  filterState.filterBtn.addEventListener('click', () => {
                    filterState.currFilter.innerHTML = filterState.filters[filterState.idx++];
                    // i++;
                    if (filterState.idx >= filterState.filters.length) filterState.idx = 0;
                  }, false); //end of filter test//

                  //changing animations//
                  animeState.animeBtn.addEventListener('click', () => {
                    animeState.currAnime.innerHTML = animeState.animeKeys[animeState.idx];
                    animeState.currentAnimation = animeState.anime[animeState.animeKeys[animeState.idx++]];
                    console.log(animeState.currentAnimation);
                    // j++;
                    if (animeState.idx >= animeState.animeKeys.length) animeState.idx = 0;
                  }, false)

                  //adding click handler for active emoji selection
                  Array.from(animeState.emojis, (ele) => {
                    ele.addEventListener('click', (event) => {
                      animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                      console.log(animeState.currentImg)
                      animeState.emoImg.src = animeState.currentImg;
                    }, false)
                  })

                  //attempts to clear canvas
                  clearButton.addEventListener('click', (event) => {
                    cancelAnimationFrame(animeState.raf);
                    mediaState.myContext.clearRect(0, 0, mediaState.myCanvas.width, mediaState.myCanvas.height);
                    mediaState.peerContext.clearRect(0, 0, mediaState.peerCanvas.width, mediaState.peerCanvas.height);
                  }, false);

                  //end of interactivity

                  //on data event
                  channel.onmessage = event => {
                    let data = event.data;

                    //conditionally apply or remove filter
                    let dataObj = JSON.parse(data);

                    if (dataObj.message) {
                      document.getElementById('messages').textContent += dataObj.message + '\n';
                    }

                    if (dataObj.hasOwnProperty('local')) {
                      if (dataObj.local) {
                        setVendorCss(mediaState.peerVideo, dataObj.filterType);
                      } //conditionally applies or removes filter
                      else if (!dataObj.local) {
                        setVendorCss(mediaState.myVideo, dataObj.filterType);
                      }
                    }

                    if (dataObj.hasOwnProperty('localEmoji')) {
                      if (dataObj.localEmoji) {
                        //remote display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        animeState.temp = animeState.currentAnimation;
                        animeState.currentAnimation = eval('(' + dataObj.animation + ')');
                        animeState.currentAnimation(mediaState.peerCanvas, mediaState.peerContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity]);
                        animeState.currentAnimation = animeState.temp;

                      } else if (!dataObj.localEmoji) {
                        //local display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        animeState.temp = animeState.currentAnimation;
                        animeState.currentAnimation = eval('(' + dataObj.animation + ')');
                        animeState.currentAnimation(mediaState.myCanvas, mediaState.myContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity]);
                        animeState.currentAnimation = animeState.temp;
                      }
                    }
                  }
                }

                function otherDataChannel(event) {
                  rtcState.peerConn.ondatachannel = (event) => {
                    console.log('not initiator data channel start', event.channel);
                    rtcState.dataChannel = event.channel;
                    onDataChannelCreated(rtcState.dataChannel);
                  }
                }

                //misc webRTC helper functions

                function sendMessage(data, who) {
                  let message = {
                    roomID: roomState.roomID,
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
                  rtcState.remoteStream = event.stream;
                  console.log('local', rtcState.localStream, 'remote', rtcState.remoteStream)

                  mediaState.peerMedia = mediaGenerator(event.stream, roomState.vendorUrl, 'peerBooth', 'peerVideo', 'peerCanvas', 533, 400);

                  mediaState.peerVideo = mediaState.peerMedia.video;
                  mediaState.peerCanvas = mediaState.peerMedia.canvas;
                  mediaState.peerContext = mediaState.peerMedia.context;

                  animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition); //remote

                } ///end on stream added event///

                function handleRemoteStreamRemoved(event) {
                  console.log('Remote Stream removed, event: ', event);
                  // socket.emit('disconnect');
                  // location.reload();
                }

                function doCall() {
                  console.log('sending offer to peer');
                  rtcState.peerConn.createOffer().then(setLocalAndSendMessage).catch(err => {
                    console.log('create offer error: ' + err);
                  });
                }

                function doAnswer() {
                  console.log('Sending answer to peer.');
                  rtcState.peerConn.createAnswer().then(
                    setLocalAndSendMessage).catch(err => {
                    console.log('create offer error: ' + err);
                  });
                }

                function setLocalAndSendMessage(sessionDescription) {
                  rtcState.peerConn.setLocalDescription(sessionDescription);
                  console.log('setLocalAndSendMessage. Sending Message', sessionDescription);
                  sendMessage(sessionDescription, 'other');
                } //close misc webRTC helper function

                function endCall() {
                  rtcState.peerConn.close();
                  rtcState.peerConn = null;
                  socket.disconnect()
                  rtcState.localStream.getTracks().forEach((track) => {
                    track.stop();
                  });
                  mediaState.myVideo.src = "";
                  mediaState.peerVideo.src = "";
                  document.getElementById('connect').disabled = true;
                  document.getElementById('disconnect').disabled = true;
                  document.getElementById('roomApp').classList.remove('hidden');
                  document.getElementById('mainApp').classList.add('hidden');
                }

                //disconnect event
                document.getElementById('disconnect').addEventListener('click', function(event) {
                    console.log('hi there Blake')
                    socket.emit('severe');
                  }) //end of disconnect click event//

                socket.on('updateChatters', (chatter) => {
                  socket.emit('severe')
                  endCall();
                  document.getElementById('messages').textContent += 'notification: ' + chatter + ' has left.' + '\n';
                  roomState.chattersClient.splice(roomState.chattersClient.indexOf(chatter), 1);
                  // document.getElementById('connect').disabled = false;
                });

              }, //end of stream//
              function(err) {
                console.error(err);
              });

          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }, false) //end of 'join' event

});
