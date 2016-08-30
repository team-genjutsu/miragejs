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

document.addEventListener("DOMContentLoaded", (event) => {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,
    roomID,
    // variables for video, peerCanvas, and context logic
    peerMedia,
    peerVideo,
    peerCanvas,
    peerContext,
    myMedia,
    myCanvas,
    myVideo,
    myContext,
    // variables for filter logic
    currFilter = document.getElementById('filterDisp'),
    filterBtn = document.getElementById('filter'),
    filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'],
    i = 0,
    // clear canvas
    clearButton = document.getElementById('clear'),
    // animation variables
    anime = {
      paste: paste,
      bounce: bounce,
      orbit: orbit
    },
    animeKeys = ['paste', 'bounce', 'orbit'],
    j = 1,
    animeBtn = document.getElementById('animation'),
    currAnime = document.getElementById('animateDisp'),
    currentAnimation,
    temp,
    // room buttons
    joinButton = document.getElementById('join-button'),
    randomButton = document.getElementById('random-button'),
    // raf stands for requestAnimationFrame, enables drawing to occur
    raf,
    emoImg = new Image(),
    currentImg = 'assets/emojione/small/1f436.png',
    emojis = document.getElementsByClassName('emoji'),
    // video / audio configuration
    sdpConstraints = {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    },
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
  //turn server to use
  //if (location.hostname != 'localhost') {
  //  requestTurn(
  //    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  //  );
  //}
  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia; //end vendor media objects//

  //room selection
  joinButton.addEventListener('click', () => {
      const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/') 
      roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomID));

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
              }, function(stream) {

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

                  myMedia = mediaGenerator(stream, vendorUrl, 'myBooth', 'myVideo', 'myCanvas', 533, 400);

                  myVideo = myMedia.video;
                  myCanvas = myMedia.canvas;
                  myContext = myMedia.context;

                  //sets up local stream reference
                  localStream = stream;
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

                  //instantiate peer objects and finish signaling for webRTC data and video channels
                  document.getElementById('connect').addEventListener('click', function() {
                    startSetup();
                    //data channel creation
                    console.log('init creating data channel')
                      //create data channel
                    dataChannel = peerConn.createDataChannel('interact');
                    console.log(dataChannel)
                    onDataChannelCreated(dataChannel)
                      //audio/ video creation
                    doCall();
                  });

                  socket.on('message', function(message) {
                    console.log("Client received Message", message);
                    if (message.type === 'offer') {
                      if (!isStarted) {
                        startSetup();
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

                function startSetup() {
                  console.log('startSetup? ', isStarted, localStream);
                  if (!isStarted && typeof localStream !== 'undefined') {
                    console.log('creating peer connection')
                    createPeerConnection();
                    peerConn.addStream(localStream);
                    isStarted = true;
                  }
                }

                function createPeerConnection() {
                  try {
                    peerConn = new RTCPeerConnection(pcConfig)
                    peerConn.onicecandidate = handleIceCandidate;
                    peerConn.onaddstream = handleRemoteStreamAdded;
                    peerConn.onremovestream = handleRemoteStreamRemoved;

                    document.getElementById('disconnect').addEventListener('click', function(event) {
                        peerConn.close();
                      }) //end of disconnect click event//

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
                      dataChannel.send(yourMessageObj);
                    }) //end send click event//

                  //click event for the "filter me" button//
                  filterListener(myVideo, 'myFilter', currFilter, true, dataChannel, setVendorCss);
                  //click event for the "filter them" button
                  filterListener(peerVideo, 'peerFilter', currFilter, false, dataChannel, setVendorCss);

                  animationListener(myCanvas, emoImg, anime, currAnime, myContext, raf, [velocity, angularVelocity], dataChannel, true, getCursorPosition); //local

                  //changing filters//
                  filterBtn.addEventListener('click', () => {
                    currFilter.innerHTML = filters[i];
                    i++;
                    if (i >= filters.length) i = 0;
                  }, false); //end of filter test//

                  //changing animations//
                  animeBtn.addEventListener('click', () => {
                    currAnime.innerHTML = animeKeys[j];
                    currentAnimation = anime[animeKeys[j]];
                    console.log(currentAnimation);
                    j++;
                    if (j >= animeKeys.length) j = 0;
                  }, false)

                  //adding click handler for active emoji selection
                  Array.from(emojis, (ele) => {
                    ele.addEventListener('click', (event) => {
                      currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                      console.log(currentImg)
                      emoImg.src = currentImg;
                    }, false)
                  })

                  //attempts to clear canvas
                  clearButton.addEventListener('click', (event) => {
                    cancelAnimationFrame(raf);
                    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
                    peerContext.clearRect(0, 0, peerCanvas.width, peerCanvas.height);
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
                        setVendorCss(peerVideo, dataObj.filterType);
                      } //conditionally applies or removes filter
                      else if (!dataObj.local) {
                        setVendorCss(myVideo, dataObj.filterType);
                      }
                    }

                    if (dataObj.hasOwnProperty('localEmoji')) {
                      if (dataObj.localEmoji) {
                        //remote display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        temp = currentAnimation;
                        currentAnimation = eval('(' + dataObj.animation + ')');
                        currentAnimation(peerCanvas, peerContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                        currentAnimation = temp;

                      } else if (!dataObj.localEmoji) {
                        //local display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        temp = currentAnimation;
                        currentAnimation = eval('(' + dataObj.animation + ')');
                        currentAnimation(myCanvas, myContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                        currentAnimation = temp;
                      }
                    }
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
                  console.log('local', localStream, 'remote', remoteStream)

                  peerMedia = mediaGenerator(event.stream, vendorUrl, 'peerBooth', 'peerVideo', 'peerCanvas', 533, 400);

                  peerVideo = peerMedia.video;
                  peerCanvas = peerMedia.canvas;
                  peerContext = peerMedia.context;

                  animationListener(peerCanvas, emoImg, anime, currAnime, peerContext, raf, [velocity, angularVelocity], dataChannel, false, getCursorPosition); //remote
                  
                } ///end on stream added event///

                function handleRemoteStreamRemoved(event) {
                  console.log('Remote Stream removed, event: ', event);
                  socket.emit('disconnect');
                  location.reload();
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
                } //close misc webRTC helper function


              }, //end of stream//
              function(err) {
                console.error(err);
              });

            
          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }, false) //end of 'join' event

});
