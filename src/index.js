import adapter from 'webrtc-adapter';
import io from 'socket.io-client';
import {
  filterListener,
  animationListener,
  clearListener
} from './components/listenerFuncs';
import {
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
  setSizes
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
} from './components/mirageWebRTC';
import {
  mirageChunk
} from './components/chunk';
import {
  cssChunk
} from './components/cssChunk';



export function createMirage() {

  const mirageComponent = {};

  mirageComponent.putFilters = null;
  mirageComponent.putImages = null;

  mirageComponent.events = {
    stream: null,
    onMessage: null,
    onData: null
  };

  mirageComponent.on = (event, func) => {
    mirageComponent.events[event] = func;
  };

  mirageComponent.insertCss = () => {
    document.head.insertAdjacentHTML('beforeend', cssChunk);
  };

  mirageComponent.insertChunk = () => {

    document.body.insertAdjacentHTML('afterbegin', mirageChunk);
  };

  mirageComponent.startApp = () => {

    //states//
    let roomState;
    let mediaState;
    let filterState;
    let animeState;
    let rtcState;

    // clear canvas
    let clearButton = document.getElementById('MRGclear');
    // room buttons
    let joinButton = document.getElementById('MRGjoin-button');
    // mirage component button
    let materialBtn = document.getElementById('MRGmaterialBtn');

    //turn server to use
    //if (location.hostname != 'localhost') {
    //  requestTurn(
    //    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    //  );
    //}


    materialBtn.addEventListener('click', () => {
      let demo = document.getElementById('MRGdemo');
      let matBtn = document.getElementById('MRGmaterialBtn');

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

      roomState = new roomStore(window.URL);
      mediaState = new mediaStore('MRGmyBooth', 'MRGpeerBooth');
      filterState = new filterStore('MRGfilterDisp', 'MRGfilter');
      animeState = new animeStore('MRGanimation', 'MRGanimateDisp', 'MRGemoji', [paste, bounce, orbit]);
      rtcState = new rtcStore();

      //add input filters or images
      filterState.addFilters(mirageComponent.putFilters);
      animeState.addEmoji(mirageComponent.putImages);

      const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/')
      roomState.roomID = document.getElementById('MRGroom-id-input').value;
      appendConnectButtons();

      animeState.emojis.forEach((ele, idx) => {
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

      socket.emit('joinRoom', JSON.stringify(roomState.roomID));
      socket.on('process', (payload) => {
        payload = JSON.parse(payload);
        if (!payload) {
          alert('Try a different room!');
        } else {
          hiddenToggle('MRGroomApp', 'MRGboothApp');
          //begin streaming!//
          navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
          
              //make initiate event happen automatically when streaming begins
            socket.emit('initiate', JSON.stringify({
              streamId: stream.id,
              roomId: roomState.roomID
            }));

            socket.on('readyConnect', (payload) => {
              document.getElementById('MRGconnect').disabled = false;
              classToggle('MRGconnect', 'MRGelementToFadeInAndOut');
            });


            socket.on('initiated', (member) => {

              member = JSON.parse(member);
              mediaState.myMedia = mediaGenerator(stream, roomState.vendorUrl, 'MRGmyBooth', 'MRGmyVideo', 'MRGmyCanvas');
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

              document.getElementById('MRGconnect').addEventListener('click', () => {
                connectEvents(rtcState, roomState, handleRemoteStreamAdded, onDataChannelCreated, socket);
                classToggle('MRGconnect', 'MRGelementToFadeInAndOut');
                // onDataChannelCreated(rtcState.dataChannel)
              });

              socket.on('message', (message) => {
                if (message.type === 'offer') {
                  if (!rtcState.isStarted) {
                    startSetup(rtcState, roomState, handleRemoteStreamAdded, socket);
                    otherDataChannel(event, rtcState, onDataChannelCreated, activateAnime);
                  }
                  rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                  doAnswer(rtcState, roomState, socket);
                } else if (message.type === 'answer' && rtcState.isStarted) {
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

            function onDataChannelCreated(channel) {
                //data channel stuff
              channel.onopen = () => {

                // console.log('data channel onopen method triggered');
                mediaState.peerCanvasListeners.push(animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], channel, false, getCursorPosition, animeState.rafObj)); //remote

                mediaState.myCanvasListeners.push(animationListener(mediaState.myCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.myContext, animeState.raf, [velocity, angularVelocity], channel, true, getCursorPosition, animeState.rafObj)); //local

                filterListener(mediaState.myVideo, 'MRGmyFilter', filterState.currFilter, true, channel, setVendorCss);

                filterListener(mediaState.peerVideo, 'MRGpeerFilter', filterState.currFilter, false, channel, setVendorCss);

                clearListener(channel, clearFunc, clearButton, animeState, mediaState);

                document.getElementById('MRGvideoToggle').addEventListener('click', () => {
                  toggleVidSize(window, mediaState, generateDims, vidDims, classToggle);
                });

                  // changing this because the multi event listener is retogglei
                disableToggle('MRGconnect', 'MRGdisconnect');

                window.onresize = () => {
                  resizeMedia(window, mediaState, document.getElementById('MRGvidContainer'), generateDims, vidDims, setSizes);
                };

                  //changing filters//
                filterState.filterBtn.addEventListener('click', () => {
                  filterState.currFilter.innerHTML = filterState.filters[filterState.idx++];
                  if (filterState.idx >= filterState.filters.length) filterState.idx = 0;
                }, false); //end of filter test//

                  //changing animations//
                animeState.animeBtn.addEventListener('click', () => {
                  animeState.currAnime.innerHTML = animeState.animeKeys[animeState.idx];
                  animeState.currentAnimation = animeState.anime[animeState.animeKeys[animeState.idx++]];
                  if (animeState.idx >= animeState.animeKeys.length) animeState.idx = 0;
                }, false);

                  //adding click handler for active emoji selection
                Array.from(animeState.emoBtns, (ele) => {
                  ele.addEventListener('click', (event) => {
                    animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                    animeState.emoImg.src = animeState.currentImg;
                  }, false);
                });

                mirageComponent.events.onData({
                  mediaState: mediaState, 
                  filterState: filterState, 
                  roomState: roomState, 
                  animeState: animeState, 
                  rtcState: rtcState
                });
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
                    setVendorCss(mediaState.peerVideo, dataObj.filterType);
                  } else {
                    setVendorCss(mediaState.myVideo, dataObj.filterType);
                  }
                }

                if (dataObj.hasOwnProperty('localEmoji')) {
                  if (dataObj.localEmoji) {
                      //remote display bounce animation!
                    let emoImg = new Image();
                    emoImg.src = dataObj.currentImg;

                    animeState.temp = animeState.currentAnimation;
                    animeState.currentAnimation = animeState.anime[dataObj.animation];
                    animeState.currentAnimation(mediaState.peerCanvas, mediaState.peerContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity], animeState.rafObj);
                    animeState.currentAnimation = animeState.temp;

                  } else if (!dataObj.localEmoji) {
                      //local display bounce animation!
                    let emoImg = new Image();
                    emoImg.src = dataObj.currentImg;

                    animeState.temp = animeState.currentAnimation;
                    animeState.currentAnimation = animeState.anime[dataObj.animation];
                    animeState.currentAnimation(mediaState.myCanvas, mediaState.myContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity], animeState.rafObj);
                    animeState.currentAnimation = animeState.temp;

                  }
                }
                if (dataObj.type === 'clear') {
                  clearFunc(animeState, mediaState);
                }

                mirageComponent.events.onMessage({
                  dataMsg: dataObj,    
                  mediaState: mediaState, 
                  filterState: filterState, 
                  roomState: roomState, 
                  animeState: animeState, 
                  rtcState: rtcState
                });
              };
            }


            function handleRemoteStreamAdded(event) {
              // after adding remote sream, set the source of peer video to their stream
              rtcState.remoteStream = event.stream;
              mediaState.peerMedia = mediaGenerator(event.stream, roomState.vendorUrl, 'MRGpeerBooth', 'MRGpeerVideo', 'MRGpeerCanvas');
              mediaState.peerVideo = mediaState.peerMedia.video;
              mediaState.peerCanvas = mediaState.peerMedia.canvas;
              mediaState.peerContext = mediaState.peerMedia.context;
              mediaState.peerCanvas.classList.add('MRGpointerToggle');

              toggleVidSize(window, mediaState, generateDims, vidDims, classToggle);
              hiddenToggle('MRGconnect', 'MRGdisconnect');

              mirageComponent.events.stream({
                  mediaState: mediaState, 
                  filterState: filterState, 
                  roomState: roomState, 
                  animeState: animeState, 
                  rtcState: rtcState
                });
            } ///end on stream added event///

            function activateAnime() {
              animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition, animeState.rafObj); //remote
            }

              //all this disconnect logic needs to be revamped, VERY SOON!
            function endCall() {
              socket.disconnect();
              rtcState.peerConn.close();
              rtcState.dataChannel.close();
              // rtcState.peerConn = null;
              rtcState.localStream.getTracks().forEach((track) => {
                track.stop();
              });
                // mediaState.myVideo.src = "";
                // mediaState.peerVideo.src = "";

              roomState = null;
              mediaState = null;
              filterState = null;
              animeState = null;
              rtcState = null;

              // disableToggle('connect', 'disconnect');
              // let element = document.getElementById("top");
              //remove old video instances from the dom as well as connect buttons
              removeChildren('MRGmyBooth');
              removeChildren('MRGpeerBooth');
              removeChildren('MRGconnectivityBtns');
              removeChildren('MRGemojiButtons');

              hiddenToggle('MRGroomApp', 'MRGboothApp');
            }

              //disconnect event
            document.getElementById('MRGdisconnect').addEventListener('click', (event) => {
              socket.emit('disconnect');
              endCall();
              hiddenToggle('MRGconnect', 'MRGdisconnect');
            }); //end of disconnect click event//

            socket.on('updateChatters', (chatter) => {
              socket.emit('disconnect');
              endCall();
              // document.getElementById('MRGmessages').textContent += 'notification: ' + chatter + ' has left.' + '\n';
              roomState.chattersClient.splice(roomState.chattersClient.indexOf(chatter), 1);
                // document.getElementById('connect').disabled = false;
            });

          }, //end of stream//
            (err) => {
              console.error(err);
            });

        } //end of boolean in socket 'process' event

      }); //end of socket 'process' event

    }, false); //end of 'join' event

  };
  return mirageComponent;
}

