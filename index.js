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


function createMirage() {

  const mirageComponent = {};


  mirageComponent.startApp = () => {

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
              hiddenToggle(document.getElementById('roomApp'), document.getElementById('boothApp'))
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


                    socket.on('message', function(message) {
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

                    channel.onopen = function() {
                      // console.log('data channel opened');
                    };

                    //after creation of data channel switch button visilibity
                    disableToggle(document.getElementById('connect'), document.getElementById('disconnect'))

                    //beginning of interactivity
                    //looks for click event on the send button//
                    document.getElementById('send').addEventListener('click', function() {
                        //post message in text context on your side
                        //send message object to the data channel
                        // console.log(rtcState.peerConn);
                        let yourMessageObj = JSON.stringify({
                          message: "them:" + " " + document.getElementById('yourMessage').value
                        });
                        //creates a variable with the same information to display on your side
                        //peer.localPort is a temporary way to identify peers, should be changed
                        let yourMessage = "me:" + " " + document.getElementById('yourMessage').value;
                        //post message in text context on your side
                        document.getElementById('messages').textContent += yourMessage + '\n';
                        // rtcState.dataChannel.send(yourMessageObj);
                        channel.send(yourMessageObj)
                      }) //end send click event//

                    //click event for the "filter me" button//
                    // filterListener(mediaState.myVideo, 'myFilter', mediaState.currFilter, true, rtcState.dataChannel, setVendorCss);
                    filterListener(mediaState.myVideo, 'myFilter', mediaState.currFilter, true, channel, setVendorCss);
                    //click event for the "filter them" button
                    // filterListener(mediaState.peerVideo, 'peerFilter', mediaState.currFilter, false, rtcState.dataChannel, setVendorCss);
                    filterListener(mediaState.peerVideo, 'peerFilter', mediaState.currFilter, false, channel, setVendorCss);

                    // animationListener(mediaState.myCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.myContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, true, getCursorPosition); //local
                    animationListener(mediaState.myCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.myContext, animeState.raf, [velocity, angularVelocity], channel, true, getCursorPosition); //local

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
                      // console.log(animeState.currentAnimation);
                      // j++;
                      if (animeState.idx >= animeState.animeKeys.length) animeState.idx = 0;
                    }, false)

                    //adding click handler for active emoji selection
                    Array.from(animeState.emojis, (ele) => {
                      ele.addEventListener('click', (event) => {
                        animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                        // console.log(animeState.currentImg)
                        animeState.emoImg.src = animeState.currentImg;
                      }, false)
                    })

                    //attempts to clear canvas
                    clearButton.addEventListener('click', (event) => {
                      cancelAnimationFrame(animeState.raf);
                      mediaState.myContext.clearRect(0, 0, mediaState.myCanvas.width, mediaState.myCanvas.height);
                      mediaState.peerContext.clearRect(0, 0, mediaState.peerCanvas.width, mediaState.peerCanvas.height);
                    }, false);

                    document.getElementById('videoToggle').addEventListener('click', () => {
                        hiddenToggle(document.getElementById('myBooth'), document.getElementById('peerBooth'));
                        blinkerOff('videoToggle');
                      })
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
                          blinkerOn('peerBooth', 'videoToggle');
                        } //conditionally applies or removes filter
                        else if (!dataObj.local) {
                          setVendorCss(mediaState.myVideo, dataObj.filterType);
                          blinkerOn('myBooth', 'videoToggle');

                          //add function to make toggle button blink
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
                          blinkerOn('peerBooth', 'videoToggle')

                        } else if (!dataObj.localEmoji) {
                          //local display bounce animation!
                          let emoImg = new Image();
                          emoImg.src = dataObj.currentImg;

                          animeState.temp = animeState.currentAnimation;
                          animeState.currentAnimation = eval('(' + dataObj.animation + ')');
                          animeState.currentAnimation(mediaState.myCanvas, mediaState.myContext, event, dataObj.position, emoImg, animeState.raf, [velocity, angularVelocity]);
                          animeState.currentAnimation = animeState.temp;
                          blinkerOn('myBooth', 'videoToggle')

                        }
                      }
                    }
                  }


                  function handleRemoteStreamAdded(event) {
                    // console.log('Remote Stream Added, event: ', event);
                    rtcState.remoteStream = event.stream;
                    // console.log('local', rtcState.localStream, 'remote', rtcState.remoteStream)

                    mediaState.peerMedia = mediaGenerator(event.stream, roomState.vendorUrl, 'peerBooth', 'peerVideo', 'peerCanvas');

                    mediaState.peerVideo = mediaState.peerMedia.video;
                    mediaState.peerCanvas = mediaState.peerMedia.canvas;
                    mediaState.peerContext = mediaState.peerMedia.context;

                    hiddenToggle(document.getElementById('myBooth'), document.getElementById('peerBooth'));

                    animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition); //remote

                    window.onresize = () => {
                      resize(window, myVideo, peerVideo, myCanvas, peerCanvas, myContext, peerContext, document.getElementById('vidContainer'), generateDims);
                    }
                  } ///end on stream added event///


                  function activateAnime() {
                    animationListener(mediaState.peerCanvas, animeState.emoImg, animeState.anime, animeState.currAnime, mediaState.peerContext, animeState.raf, [velocity, angularVelocity], rtcState.dataChannel, false, getCursorPosition); //remote
                  }

                  //all this disconnect logic needs to be revamped, VERY SOON!
                  function endCall() {
                    rtcState.peerConn.close();
                    rtcState.peerConn = null;
                    socket.disconnect()
                    rtcState.localStream.getTracks().forEach((track) => {
                      track.stop();
                    });
                    mediaState.myVideo.src = "";
                    mediaState.peerVideo.src = "";

                    hiddenToggle(document.getElementById('roomApp'), document.getElementById('boothApp'));
                    disableToggle(document.getElementById('connect'), document.getElementById('disconnect'));
                  }

                  //disconnect event
                  document.getElementById('disconnect').addEventListener('click', function(event) {
                      // console.log('hi there Blake')
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


    //these functions need to be ported to proper file
    function hiddenToggle(ele1, ele2) {
      let args = [...arguments];
      args.forEach((ele, idx) => {
        ele.classList.toggle('hidden');
      })
    }

    function disableToggle(ele1, ele2) {
      let args = [...arguments];
      args.forEach((ele, idx) => {
        ele.disabled ? ele.disabled = false : ele.disabled = true;
      })
    }

    function resize(win, locVideo, remVideo, locCanvas, remCanvas, locContext, remContext, container, func) {

      let dims = func(container, win);
      //resize local elements
      locVideo.setAttribute('width', '' + dims.vidWidth);
      locVideo.setAttribute('height', '' + dims.vidHeight);

      locCanvas.setAttribute('width', '' + dims.vidWidth);
      locCanvas.setAttribute('height', '' + dims.vidHeight);

      //resize remote elements
      remVideo.setAttribute('width', '' + dims.vidWidth);
      remVideo.setAttribute('height', '' + dims.vidHeight);

      remCanvas.setAttribute('width', '' + dims.vidWidth);
      remCanvas.setAttribute('height', '' + dims.vidHeight);
    }

    function generateDims(container, win) {
      let containerStyle = win.getComputedStyle(container);
      let styleWidth = containerStyle.getPropertyValue('width');
      let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
      let videoHeight = Math.round((videoWidth / 4) * 3);

      return {
        vidWidth: videoWidth,
        vidHeight: videoHeight
      }
    }

    function scaleToFill(videoTag, height, width) {
      let video = videoTag,
        videoRatio = 4 / 3,
        tagRatio = width / height;
      if (videoRatio < tagRatio) {
        video.setAttribute('style', '-webkit-transform: scaleX(' + tagRatio / videoRatio + ')')
      } else if (tagRatio < videoRatio) {
        video.setAttribute('style', '-webkit-transform: scaleY(' + videoRatio / tagRatio + ')')
      }
    }

    function scaleElement(vid, height, width) {
      let video = vid;
      let actualRatio = 4 / 3;
      let targetRatio = width / height;
      let adjustmentRatio = targetRatio / actualRatio;
      let scale = actualRatio < targetRatio ? targetRatio / actualRatio : actualRatio / targetRatio;
      console.log(scale);
      video.setAttribute('style', '-webkit-transform: scale(' + scale + ')');
    };

    function blinkerOn(boothEleId, btnEleId) {
      if (document.getElementById(boothEleId).classList.contains('hidden')) {
        document.getElementById(btnEleId).classList.toggle('elementToFadeInAndOut');
      }
    }

    function blinkerOff(btnId) {
      document.getElementById(btnId).classList.remove('elementToFadeInAndOut');
    }

  }
  return mirageComponent;
}

export {
  createMirage
};
