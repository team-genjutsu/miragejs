import adapter from 'webrtc-adapter';
import io from 'socket.io-client';

import {
  mediaGenerator
} from './mediaGenerator';

import {
  roomStore,
  mediaStore,
  rtcStore,
  elementStore
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
  setLocalAndSendMessage,
  endCall,
  handleRemoteStreamAdded,
  onDataChannelCreated
} from './mirageWebRTC';

// require('./tracking');
// need to abstract a little bit more, and then make tracking data available
// to user manipulation


function mirageApp(events, state, domIds) {

  domIds = domIds || ['MRGjoin-button', 'MRGconnect', 'MRGdisconnect', 'MRGroom-id-input', 'MRGmyBooth', 'MRGmyVideo', 'MRGmyCanvas', 'MRGpeerBooth', 'MRGpeerVideo', 'MRGpeerCanvas'];

  state.elementState = new elementStore(domIds);

  //initial user input event
  events.initial(state);

  let promisifiedOldGUM = function(constraints) {

    // First get ahold of getUserMedia, if present
    let getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

    // Return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });

  };

  // For older browsers 
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  //add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
  }

  // Prefer camera resolution nearest to 1280x720.
  var constraints = {
    audio: false,
    video: true
  };

  state.elementState.joinButton.addEventListener('click', () => {

    // state.mediaState = new mediaStore('MRGmyBooth', 'MRGpeerBooth');
    // state.filterState = new filterStore('MRGfilterDisp', 'MRGfilter');
    // state.animeState = new animeStore('MRGanimation', 'MRGanimateDisp', 'MRGemoji', [paste, bounce, orbit]);
    state.rtcState = new rtcStore();
    state.roomState = new roomStore(window.URL);
    state.mediaState = new mediaStore(state.elementState.localBoothId, state.elementState.remoteBoothId);


    //add input filters or images
    // state.filterState.addFilters(filters);
    // state.animeState.addEmoji(images);

    //make user input for room id input field
    const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/')
    state.roomState.roomID = document.getElementById(state.elementState.roomInputId).value;


    socket.emit('joinRoom', JSON.stringify(state.roomState.roomID));
    socket.on('process', (payload) => {
      payload = JSON.parse(payload);
      if (!payload) {
        alert('Try a different room!');
      } else {

        //start streaming right after inserting user preStream input
        events.preStream(state);

        navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {

            //test for positioning user input event listener 
            //immediately after local stream is available
            events.localStream(state);


            //make initiate event happen automatically when streaming begins
            socket.emit('initiate', JSON.stringify({
              streamId: stream.id,
              roomId: state.roomState.roomID
            }));

            socket.on('readyConnect', (payload) => {
              
              //user input for readyConnect event
              events.readyConnect(state);
            });

            //disconnect event
            state.elementState.disconnectElement.addEventListener('click', (event) => {
              socket.emit('disconnect');
              endCall(socket, state, events);
              state.elementState = new elementStore(domIds);
            }); //end of disconnect click event//

            socket.on('updateChatters', (chatter) => {
              socket.emit('disconnect');
              endCall(socket, state, events);
              state.elementState = new elementStore(domIds);
              // document.getElementById('MRGmessages').textContent += 'notification: ' + chatter + ' has left.' + '\n';
              state.roomState.chattersClient.splice(state.roomState.chattersClient.indexOf(chatter), 1);
              // document.getElementById('connect').disabled = false;
            });

            socket.on('initiated', (member) => {

              member = JSON.parse(member);
              mediaGenerator(stream, true, state);

              //sets up local stream reference
              state.rtcState.localStream = stream;
              //set room ID shared between clients
              state.roomState.roomID = member.roomId;

              if (state.roomState.chattersClient.filter(clientChatter => clientChatter.id !== member.id).length || !state.roomState.chattersClient.length) {
                state.roomState.chattersClient.push(member);
                state.roomState.chatterThisClient = member.id;
              }


              state.elementState.connectElement.addEventListener('click', () => {
                connectEvents(state, handleRemoteStreamAdded, onDataChannelCreated, socket, events, mediaGenerator);

                //user input for connectTriggered event
                events.connectTriggered(state);
              });

              socket.on('message', (message) => {
                if (message.type === 'offer') {
                  if (!state.rtcState.isStarted) {
                    startSetup(state, handleRemoteStreamAdded, socket, events, mediaGenerator);
                    otherDataChannel(event, state, onDataChannelCreated, events);
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
