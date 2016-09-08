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
  resize,
  generateDims,
  scaleToFill,
  scaleElement,
  blinkerOn,
  blinkerOff,
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
  clearFunc
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


function createMirage() {

  const mirageComponent = {};

  mirageComponent.store = (obj) => {

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
    let clearButton = document.getElementById('clear');
    // room buttons
    let joinButton = document.getElementById('join-button');

    //turn server to use
    //if (location.hostname != 'localhost') {
    //  requestTurn(
    //    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    //  );
    //}


    document.getElementById('materialBtn').addEventListener('click', () => {
      var demo = document.getElementById('demo');
      var matBtn = document.getElementById('materialBtn');

      //need to parse through stylesheets and set z-indexes of elements to -1 with
      //each toggle
      demo.classList.toggle('hidden');
    });

    // vendor media objects//
    navigator.getMedia = navigator.mediaDevices.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
      navigator.msGetUserMedia; //end vendor media objects//


    joinButton.addEventListener('click', () => {


        //room selection
        roomState = roomStore(window.URL);
        mediaState = mediaStore();
        filterState = filterStore('filterDisp', 'filter');
        animeState = animeStore('animation', 'animateDisp', 'emoji', [paste, bounce, orbit]);
        rtcState = null;
        console.log('rtcstate pre join', rtcState);
        rtcState = rtcStore();
        console.log('rtcstate post join', rtcState);
        const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/')
        roomState.roomID = document.getElementById('room-id-input').value;
        appendConnectButtons();

        animeState.emojis.forEach((ele, idx) => {
          let btn = document.createElement('button');
          btn.classList.add('btn');
          btn.classList.add('btn-default');
          btn.classList.add('emoji');
          let emoj = document.createElement('img');
          emoj.classList.add('img-responsive');
          emoj.src = ele;
          btn.appendChild(emoj);
          document.getElementById('emojiButtons').appendChild(btn);
        });


        socket.emit('joinRoom', JSON.stringify(roomState.roomID));
        (console.log('afteremitjoin'))
        socket.on('process', (payload) => {
            payload = JSON.parse(payload);
            if (!payload) {
              alert('Try a different room!')
            } else {
              hiddenToggle('roomApp', 'boothApp')
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
                    console.log('before add media', mediaState)
                    mediaState.myMedia = mediaGenerator(stream, roomState.vendorUrl, 'myBooth', 'myVideo', 'myCanvas');
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

                    document.getElementById('connect').addEventListener('click', () => {
                      connectEvents(rtcState, roomState, handleRemoteStreamAdded, onDataChannelCreated, socket)
                        // onDataChannelCreated(rtcState.dataChannel)
                    });

                    socket.on('message', (message) => {
                      // console.log("Client received Message", message);
                      if (message.type === 'offer') {
                        if (!rtcState.isStarted) {
                          startSetup(rtcState, roomState, handleRemoteStreamAdded, socket);
                          otherDataChannel(event, rtcState, onDataChannelCreated, activateAnime);
                        }
                        rtcState.peerConn.setRemoteDescription(new RTCSessionDescription(message));
                        doAnswer(rtcState, roomState, socket);
                      } else if (message.type === 'answer' && rtcState.isStarted) {
                        // console.log('Got answer');
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


                  //data channel stuff
                  function onDataChannelCreated(channel) {

                    channel.onopen = () => {

                      console.log('data channel onopen method triggered');
                      animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition, animeState.rafObj); //remote

                      animationListener(mediaState.myCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.myContext, animeState.raf, [velocity, angularVelocity], channel, true, getCursorPosition, animeState.rafObj); //local

                      filterListener(mediaState.myVideo, 'myFilter', filterState.currFilter, true, channel, setVendorCss);

                      filterListener(mediaState.peerVideo, 'peerFilter', filterState.currFilter, false, channel, setVendorCss);

                      clearListener(channel, clearFunc, clearButton, animeState, mediaState);

                      //this would work, or store these dom elements as variables or don't use anon functions to remove listeners on end

                      document.getElementById('videoToggle').addEventListener('click', () => {
                        // hiddenToggle('myBooth', 'peerBooth');
                        toggleVidSize(window, mediaState, generateDims, vidDims);
                        blinkerOff('videoToggle');
                      })


                      // disableToggle('connect', 'disconnect')
                      // changing this because the multi event listener is retogglei
                      disableToggle('connect', 'disconnect');

                      window.onresize = () => {
                        resize(window, mediaState, document.getElementById('vidContainer'), generateDims);
                      }

                      //changing filters//
                      if (!filterState.filterBtn.getAttribute('addedListen')) {
                        filterState.filterBtn.addEventListener('click', () => {
                          filterState.currFilter.innerHTML = filterState.filters[filterState.idx++];
                          console.log(filterState.currFilter.innerHTML)
                          if (filterState.idx >= filterState.filters.length) filterState.idx = 0;
                        }, false); //end of filter test//
                      }

                      //changing animations//
                      if (!animeState.animeBtn.getAttribute('addedListen')) {
                        animeState.animeBtn.addEventListener('click', () => {
                          animeState.currAnime.innerHTML = animeState.animeKeys[animeState.idx];
                          animeState.currentAnimation = animeState.anime[animeState.animeKeys[animeState.idx++]];
                          if (animeState.idx >= animeState.animeKeys.length) animeState.idx = 0;
                        }, false)
                      }

                      //adding click handler for active emoji selection
                      Array.from(animeState.emoBtns, (ele) => {
                        ele.addEventListener('click', (event) => {
                          animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                          animeState.emoImg.src = animeState.currentImg;
                        }, false)
                      })

                      //attempts to clear canvas
                      // clearButton.addEventListener('click', (event) => {
                      //
                      //   for (let rafID in animeState.rafObj) {
                      //     cancelAnimationFrame(animeState.rafObj[rafID]);
                      //     console.log(rafID);
                      //   }
                      //
                      //   mediaState.myContext.clearRect(0, 0, mediaState.myCanvas.width, mediaState.myCanvas.height);
                      //   mediaState.peerContext.clearRect(0, 0, mediaState.peerCanvas.width, mediaState.peerCanvas.height);
                      //
                      //   //send to other client to run clear function
                      //   channel.send(JSON.stringify({'type' : 'clear'}));
                      // }, false);

                      document.getElementById('videoToggle').setAttribute('addedListen', true);

                    }; //end onopen method

                    //beginning of interactivity
                    //looks for click event on the send button//
                    document.getElementById('send').addEventListener('click', () => {
                        //post message in text context on your side
                        //send message object to the data channel
                        let yourMessageObj = JSON.stringify({
                          message: "them:" + " " + document.getElementById('yourMessage').value
                        });
                        //creates a variable with the same information to display on your side
                        let yourMessage = "me:" + " " + document.getElementById('yourMessage').value;
                        //post message in text context on your side
                        document.getElementById('messages').textContent += yourMessage + '\n';
                        channel.send(yourMessageObj)
                      }) //end send click event//


                    //on data event
                    channel.onmessage = event => {

                      console.log('onmessage datachannel method triggered')
                      let data = event.data;

                      //conditionally apply or remove filter
                      let dataObj = JSON.parse(data);

                      if (dataObj.message) {
                        document.getElementById('messages').textContent += dataObj.message + '\n';
                      }

                      if (dataObj.hasOwnProperty('filter')) {
                        if (dataObj.local) {
                          //blink function is a little funky
                          setVendorCss(mediaState.peerVideo, dataObj.filterType);
                          blinkerOn('peerBooth', 'videoToggle');
                        } else {
                          setVendorCss(mediaState.myVideo, dataObj.filterType);
                          blinkerOn('myBooth', 'videoToggle');
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
                          blinkerOn('peerBooth', 'videoToggle')

                        } else if (!dataObj.localEmoji) {
                          //local display bounce animation!
                          let emoImg = new Image();
                          emoImg.src = dataObj.currentImg;

                          animeState.temp = animeState.currentAnimation;
                          animeState.currentAnimation = animeState.anime[dataObj.animation];
                          animeState.currentAnimation(mediaState.myCanvas, mediaState.myContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity], animeState.rafObj);
                          animeState.currentAnimation = animeState.temp;
                          blinkerOn('myBooth', 'videoToggle')

                        }
                      }
                      if (dataObj.type === 'clear') {
                        clearFunc(animeState, mediaState);}
                    };
                  }


                  function handleRemoteStreamAdded(event) {
                    // console.log('Remote Stream Added, event: ', event);
                    rtcState.remoteStream = event.stream;
                    console.log('local', rtcState.localStream, 'remote', rtcState.remoteStream)

                    mediaState.peerMedia = mediaGenerator(event.stream, roomState.vendorUrl, 'peerBooth', 'peerVideo', 'peerCanvas');

                    mediaState.peerVideo = mediaState.peerMedia.video;
                    mediaState.peerCanvas = mediaState.peerMedia.canvas;
                    mediaState.peerContext = mediaState.peerMedia.context;

                    // hiddenToggle('myBooth', 'peerBooth');
                    toggleVidSize(window, mediaState, generateDims, vidDims);

                  } ///end on stream added event///


                  function activateAnime() {
                    animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition, animeState.rafObj); //remote
                  }

                  //all this disconnect logic needs to be revamped, VERY SOON!
                  function endCall() {
                    console.log('disconnected');
                    socket.disconnect();
                    rtcState.peerConn.close();
                    rtcState.dataChannel.close();
                    // rtcState.peerConn = null;
                    // rtcState.localStream.getTracks().forEach((track) => {
                    //   track.stop();
                    // });
                    // mediaState.myVideo.src = "";
                    // mediaState.peerVideo.src = "";

                    // disableToggle('connect', 'disconnect');
                    let element = document.getElementById("top");
                    //remove old video instances from the dom as well as connect buttons
                    removeChildren('myBooth');
                    removeChildren('peerBooth');
                    removeChildren('connectivityBtns');
                    removeChildren('emojiButtons');

                    hiddenToggle('roomApp', 'boothApp');
                  }

                  //disconnect event
                  document.getElementById('disconnect').addEventListener('click', (event) => {
                      // console.log('hi there Blake')
                      socket.emit('disconnect');
                      endCall();
                    }) //end of disconnect click event//

                  socket.on('updateChatters', (chatter) => {
                    socket.emit('disconnect')
                    endCall();
                    document.getElementById('messages').textContent += 'notification: ' + chatter + ' has left.' + '\n';
                    roomState.chattersClient.splice(roomState.chattersClient.indexOf(chatter), 1);
                    // document.getElementById('connect').disabled = false;
                  });

                }, //end of stream//
                (err) => {
                  console.error(err);
                });

            } //end of boolean in socket 'process' event

          }) //end of socket 'process' event

      }, false) //end of 'join' event

  }
  return mirageComponent;
}

export {
  createMirage
};
