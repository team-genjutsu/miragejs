import adapter from 'webrtc-adapter';
import io from 'socket.io-client';
import {
  filterListener,
  animationListener,
  clearListener,
  myTrackingListener,
  peerTrackingListener
} from './listenerFuncs';
import {
  endCall,
  receivedAnimation,
  toggleVidSize,
  vidDims,
  hiddenToggle,
  disableToggle,
  generateDims,
  scaleToFill,
  scaleElement,
  classToggle,
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  paste,
  bounce,
  appendConnectButtons,
  removeChildren,
  clearFunc,
  toggleZindex,
  resizeMedia,
  setSizes,
  trackFace,
  hat
} from './funcStore';
import {
  mediaGenerator
} from './mediaGenerator';
import {
  roomStore,
  filterStore,
  mediaStore,
  animeStore,
  rtcStore
} from './mirageStore';
import {
  connectEvents,
  startSetup,
  createPeerConnection,
  otherDataChannel,
  sendMessage,
  handleIceCandidate,
  handleRemoteStreamRemoved,
  doCall,
  doAnswer,
  setLocalAndSendMessage
} from './mirageWebRTC';
require('./tracking');


function mirageApp(filters, images, events) {

  let state;

  // DOM elements
  let clearButton = document.getElementById('MRGclear');
  let joinButton = document.getElementById('MRGjoin-button');
  let materialBtn = document.getElementById('MRGmaterialBtn');
  let demo = document.getElementById('MRGdemo');
  let fixedComponent = document.getElementById('MRGfixed');
  let boothComponent = document.getElementById('MRGbooth');

  materialBtn.addEventListener('click', () => {
    // need to parse through stylesheets and set z-indexes of elements to -1 with
    // each toggle
    demo.classList.toggle('MRGhidden');
    toggleZindex();
  });

  materialBtn.addEventListener('drag', (event) => {
    // console.log(event);
  });

  materialBtn.addEventListener('dragend', (event) => {
    // console.log('drag over', event.clientX);
    materialBtn.style.left = event.clientX + 'px';
    materialBtn.style.top = (event.clientY - 60) + 'px';
  });




  let promisifiedOldGUM = function(constraints) {

    // First get ahold of getUserMedia, if present
    let getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });

  };

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
  }

  // Prefer camera resolution nearest to 1280x720.
  var constraints = {
    audio: false,
    video: true
  };

  joinButton.addEventListener('click', () => {

    state = {
      roomState: new roomStore(window.URL),
      mediaState: new mediaStore('MRGmyBooth', 'MRGpeerBooth'),
      filterState: new filterStore('MRGfilterDisp', 'MRGfilter'),
      animeState: new animeStore('MRGanimation', 'MRGanimateDisp', 'MRGemoji', [paste, bounce, orbit]),
      rtcState: new rtcStore()
    };

    //add input filters or images
    state.filterState.addFilters(filters);
    state.animeState.addEmoji(images);

    const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/')
    state.roomState.roomID = document.getElementById('MRGroom-id-input').value;
    appendConnectButtons();

    state.animeState.emojis.forEach((ele, idx) => {
      let btn = document.createElement('button');
      btn.classList.add('MRGemojibtn');
      btn.classList.add('MRGemoji');
      let emoj = document.createElement('img');
      emoj.src = ele;
      emoj.style.height = '25px';
      emoj.style.width = '25px';
      btn.appendChild(emoj);
      document.getElementById('MRGemojiButtons').appendChild(btn);
    });

    //test for positioning user input event listener ante-streaming
    events.preStream(state);

    socket.emit('joinRoom', JSON.stringify(state.roomState.roomID));
    socket.on('process', (payload) => {
      payload = JSON.parse(payload);
      if (!payload) {
        alert('Try a different room!');
      } else {
        hiddenToggle('MRGroomApp', 'MRGboothApp');
        //begin streaming!//
        navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {

              //test for positioning user input event listener 
              //immediately after local stream is available
            events.localStream(state);

            boothComponent.addEventListener('drag', (event) => {

            });

            boothComponent.addEventListener('dragend', (event) => {
              fixedComponent.style.left = event.clientX + 'px';
              fixedComponent.style.top = event.clientY + 'px';
            });

            //make initiate event happen automatically when streaming begins
            socket.emit('initiate', JSON.stringify({
              streamId: stream.id,
              roomId: state.roomState.roomID
            }));

            socket.on('readyConnect', (payload) => {
              document.getElementById('MRGconnect').disabled = false;
              classToggle('MRGconnect', 'MRGelementToFadeInAndOut');
            });


            socket.on('initiated', (member) => {

              member = JSON.parse(member);
              mediaGenerator(stream, true, state, 'MRGmyBooth', 'MRGmyVideo', 'MRGmyCanvas');

              //sets up local stream reference
              state.rtcState.localStream = stream;
              //set room ID shared between clients
              state.roomState.roomID = member.roomId;

              if (state.roomState.chattersClient.filter(clientChatter => clientChatter.id !== member.id).length || !state.roomState.chattersClient.length) {
                state.roomState.chattersClient.push(member);
                state.roomState.chatterThisClient = member.id;
              }

              //NB: animation and filter listeners needed in this particular context
              //in order for animation and filters to be option for a user before
              //connecting to a peer

              document.getElementById('MRGconnect').addEventListener('click', () => {
                connectEvents(state.rtcState, state.roomState, handleRemoteStreamAdded, onDataChannelCreated, socket);
                classToggle('MRGconnect', 'MRGelementToFadeInAndOut');
                // onDataChannelCreated(rtcState.dataChannel)
              });

              socket.on('message', (message) => {
                if (message.type === 'offer') {
                  if (!state.rtcState.isStarted) {
                    startSetup(state.rtcState, state.roomState, handleRemoteStreamAdded, socket);
                    otherDataChannel(event, state.rtcState, onDataChannelCreated, activateAnime);
                  }
                  state.rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                  doAnswer(state.rtcState, state.roomState, socket);
                } else if (message.type === 'answer' && state.rtcState.isStarted) {
                  state.rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                } else if (message.type === 'candidate' && state.rtcState.isStarted) {
                  let candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                  });
                  state.rtcState.peerConn.addIceCandidate(candidate);
                }
              });

            }); //end of socket.on('initiated')

            function onDataChannelCreated(channel) {
              //data channel stuff
              channel.onopen = () => {

                // console.log('data channel onopen method triggered');

                animationListener(state.mediaState.peerCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.peerContext, state.animeState.raf, [velocity, angularVelocity], channel, false, getCursorPosition, state.animeState.rafObj); //remote

                animationListener(state.mediaState.myCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.myContext, state.animeState.raf, [velocity, angularVelocity], channel, true, getCursorPosition, state.animeState.rafObj); //local

                filterListener(state.mediaState.myVideo, 'MRGmyFilter', state.filterState.currFilter, true, channel, setVendorCss);

                filterListener(state.mediaState.peerVideo, 'MRGpeerFilter', state.filterState.currFilter, false, channel, setVendorCss);

                clearListener(channel, clearFunc, clearButton, state.animeState, state.mediaState);

                myTrackingListener(state.mediaState.myVideo, state.mediaState.myCanvas, state.mediaState.myContext, state.animeState.emoImg, tracking, channel);

                peerTrackingListener(state.mediaState.peerVideo, state.mediaState.peerCanvas, state.mediaState.peerContext, state.animeState.emoImg, channel, trackFace, tracking, state.rtcState.remoteStream);

                document.getElementById('MRGvideoToggle').addEventListener('click', () => {
                  toggleVidSize(window, state.mediaState, generateDims, vidDims, classToggle);
                });

                // changing this because the multi event listener is retogglei
                disableToggle('MRGconnect', 'MRGdisconnect');

                window.onresize = () => {
                  resizeMedia(window, state.mediaState, document.getElementById('MRGvidContainer'), generateDims, vidDims, setSizes);
                };

                //changing filters//
                state.filterState.filterBtn.addEventListener('click', () => {
                  state.filterState.currFilter.innerHTML = state.filterState.filters[state.filterState.idx++];
                  if (state.filterState.idx >= state.filterState.filters.length) state.filterState.idx = 0;
                }, false); //end of filter test//

                //changing animations//
                state.animeState.animeBtn.addEventListener('click', () => {
                  state.animeState.currAnime.innerHTML = state.animeState.animeKeys[state.animeState.idx];
                  state.animeState.currentAnimation = state.animeState.anime[state.animeState.animeKeys[state.animeState.idx++]];
                  if (state.animeState.idx >= state.animeState.animeKeys.length) state.animeState.idx = 0;
                }, false);

                //adding click handler for active emoji selection
                Array.from(state.animeState.emoBtns, (ele) => {
                  ele.addEventListener('click', (event) => {
                    state.animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                    state.animeState.emoImg.src = state.animeState.currentImg;
                  }, false);
                });

                //user function for onData event listener
                events.onData(state);

              }; //end onopen method

              // for messaging if we want to integrate later
              //looks for click event on the send button//
              // document.getElementById('MRGsend').addEventListener('click', () => {
              // post message in text context on your side
              // send message object to the data channel
              // let yourMessageObj = JSON.stringify({
              // message: "them:" + " " + document.getElementById('MRGyourMessage').value
              // });
              // creates a variable with the same information to display on your side
              // let yourMessage = "me:" + " " + document.getElementById('MRGyourMessage').value;
              // post message in text context on your side
              // document.getElementById('messages').textContent += yourMessage + '\n';
              // channel.send(yourMessageObj)
              // }) //end send click event//


              //on data event
              channel.onmessage = event => {

                let data = event.data;
                //conditionally apply or remove filter
                let dataObj = JSON.parse(data);

                // if (dataObj.message) {
                // document.getElementById('MRGmessages').textContent += dataObj.message + '\n';
                // }

                if (dataObj.hasOwnProperty('filter')) {
                  if (dataObj.filter) {
                    setVendorCss(state.mediaState.peerVideo, dataObj.filterType);
                  } else {
                    setVendorCss(state.mediaState.myVideo, dataObj.filterType);
                  }
                }

                if (dataObj.hasOwnProperty('localEmoji')) {
                  if (dataObj.localEmoji) {
                    //remote display bounce animation!

                    receivedAnimation(false, state.animeState, state.mediaState, event, dataObj, velocity, angularVelocity);
                  } else if (!dataObj.localEmoji) {
                    //local display bounce animation!

                    receivedAnimation(true, state.animeState, state.mediaState, event, dataObj, velocity, angularVelocity);
                  }
                }
                if (dataObj.hasOwnProperty('tracking')) {
                  state.mediaState.myContext.clearRect(0, 0, state.mediaState.myCanvas.width, state.mediaState.myCanvas.height);


                  if (dataObj.tracking === 'yes') {
                    state.mediaState.myContext.clearRect(0, 0, state.mediaState.myCanvas.width, state.mediaState.myCanvas.height);
                    var emoji = new Image();
                    emoji.src = dataObj.image;
                    // console.log(emoji);
                    //console.log(dataObj.faceRect);
                    var adjustedRect = {
                      x: dataObj.faceRect.x,
                      y: dataObj.faceRect.y,
                      width: dataObj.faceRect.width / 2,
                      height: dataObj.faceRect.height / 2
                    };
                    hat(state.mediaState.myCanvas, state.mediaState.myContext, adjustedRect, emoji);
                  }

                }

                if (dataObj.hasOwnProperty('myTrack')) {
                  if (dataObj.myTrack === state.mediaState.myVideo) {
                    //console.log("track me fired off");
                    var myEmoji = new Image();
                    myEmoji.src = dataObj.image;
                    var tracking = dataObj.tracking;
                    var channel = dataObj.channel;
                    trackFace(state.mediaState.peerCanvas, state.mediaState.peerContext, tracking, state.rtcState.remoteStream, myEmoji, channel);
                  }
                }

                if (dataObj.type === 'clear') {
                  clearFunc(state.animeState, state.mediaState);
                }

                //user function input
                events.onMessage(state, {
                  dataObj: dataObj
                });
              };
            }


            function handleRemoteStreamAdded(event) {
              // after adding remote sream, set the source of peer video to their stream
              state.rtcState.remoteStream = event.stream;

              mediaGenerator(event.stream, false, state, 'MRGpeerBooth', 'MRGpeerVideo', 'MRGpeerCanvas');

              state.mediaState.peerCanvas.classList.add('MRGpointerToggle');

              toggleVidSize(window, state.mediaState, generateDims, vidDims, classToggle);

              hiddenToggle('MRGconnect', 'MRGdisconnect');

              //user input for streams event listener
              events.streams(state);
            } ///end on stream added event///

            function activateAnime() {
              animationListener(state.mediaState.peerCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.peerContext, state.animeState.raf, [velocity, angularVelocity], state.rtcState.dataChannel, false, getCursorPosition, state.animeState.rafObj); //remote
            }

            //disconnect event
            document.getElementById('MRGdisconnect').addEventListener('click', (event) => {
              socket.emit('disconnect');
              endCall(socket, state, removeChildren, hiddenToggle);
              hiddenToggle('MRGconnect', 'MRGdisconnect');
            }); //end of disconnect click event//

            socket.on('updateChatters', (chatter) => {
              socket.emit('disconnect');
              endCall(socket, state, removeChildren, hiddenToggle);
              // document.getElementById('MRGmessages').textContent += 'notification: ' + chatter + ' has left.' + '\n';
              state.roomState.chattersClient.splice(state.roomState.chattersClient.indexOf(chatter), 1);
              // document.getElementById('connect').disabled = false;
            });

          }, //end of stream//
          (err) => {
            console.error(err);
          });

      } //end of boolean in socket 'process' event

    }); //end of socket 'process' event

  }, false); //end of 'join' event

}

export {
  mirageApp
};
