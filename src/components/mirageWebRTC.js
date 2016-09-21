'use strict';

function connectEvents(state, handRemStream, func2, socket, events, mediaGenerator) {
  // console.log('connectEvent function: ' + rtcState);
  startSetup(state, handRemStream, socket, events, mediaGenerator);
  //data channel creation

  //create data channel
  state.rtcState.dataChannel = state.rtcState.peerConn.createDataChannel('interact');
  // audio/video creation
  // console.log(rtcState.peerConn);
  func2(state.rtcState.dataChannel, state, events);
  doCall(state.rtcState, state.roomState, socket);
}

function startSetup(state, handRemStream, socket, events, mediaGenerator) {
  // console.log('startSetup? ', rtcState.isStarted, rtcState.localStream);
  if (!state.rtcState.isStarted && typeof state.rtcState.localStream !== 'undefined') {
    // console.log('creating peer connection');
    createPeerConnection(state, handRemStream, socket, events, mediaGenerator);
    state.rtcState.peerConn.addStream(state.rtcState.localStream);
    state.rtcState.isStarted = true;
  }
}

function createPeerConnection(state, handRemStream, socket, events, mediaGenerator) {
  try {
    state.rtcState.peerConn = new RTCPeerConnection(state.rtcState.pcConfig);
    state.rtcState.peerConn.onicecandidate = () => handleIceCandidate(event, state.roomState, socket);
    state.rtcState.peerConn.onaddstream = () => handRemStream(event, state, events, mediaGenerator); //handleRemoteStreamAdded;
    state.rtcState.peerConn.onremovestream = handleRemoteStreamRemoved;
    state.rtcState.peerConn.oniceconnectionstatechange = () => handleIceConnStateChange(event, state.rtcState);
  } catch (err) {
    console.log('Failed to connect. Error: ' + err);
    return;
  }
}


function otherDataChannel(event, state, func1, events) {
  state.rtcState.peerConn.ondatachannel = (event) => {

    // console.log('not initiator data channel start', event.channel);
    state.rtcState.dataChannel = event.channel;
    func1(state.rtcState.dataChannel, state, events);
    // func2(state.mediaState, state.animeState, state.rtcState);

    //user input event for nonInitiator data channel method
    events.nonInitiatorData(state);
  };
}

//misc webRTC helper functions

function sendMessage(data, who, state, socket) {
  let message = {
    roomID: state.roomID,
    who: who,
    data: data
  };
  // console.log('Client Sending Message: ', message);
  socket.emit('message', message);
}

function handleIceCandidate(event, roomState, socket) {
  // console.log('icecandidate event ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, 'other', roomState, socket);
  } else {

    // console.log('Finished adding candidates');
  }
}

function handleIceConnStateChange(event, rtcState) {
  if (rtcState.peerConn.iceConnectionState === 'disconnected') {
    // console.log('Disconnected');
    rtcState.peerConn.close();

    // console.log('iceConn state change remove rtc', rtcState.peerConn);
  }
}

function handleRemoteStreamRemoved(event) {
  // console.log('Remote Stream removed, event: ', event);
  // socket.emit('disconnect');
  // location.reload();
}

function doCall(rtcState, roomState, socket) {
  // console.log('sending offer to peer', 'state in doCall: ' + rtcState.peerConn);
  rtcState.peerConn.createOffer().then((result) => {
    setLocalAndSendMessage(result, rtcState, roomState, socket);
  }).catch(err => {
    console.log('create offer error: ' + err);
  });
}

function doAnswer(rtcState, roomState, socket) {
  // console.log('Sending answer to peer.');
  rtcState.peerConn.createAnswer().then((result) => {
    setLocalAndSendMessage(result, rtcState, roomState, socket);
  }).catch(err => {
    console.log('create offer error: ' + err);
  });
}


function setLocalAndSendMessage(sessionDescription, rtcState, roomState, socket) {
  rtcState.peerConn.setLocalDescription(sessionDescription);
  // console.log('setLocalAndSendMessage. Sending Message', sessionDescription);
  sendMessage(sessionDescription, 'other', roomState, socket);
} //close misc webRTC helper function

function endCall(socket, state, events) {
  socket.disconnect();
  state.rtcState.peerConn.close();
  state.rtcState.dataChannel.close();
  state.rtcState.localStream.getTracks().forEach((track) => {
    track.stop();
  });

  for (var k in state) {
    state[k] = null;
  }

  events.end(state);
}

function handleRemoteStreamAdded(event, state, events, mediaGenerator) {
  // after adding remote sream, set the source of peer video to their stream
  state.rtcState.remoteStream = event.stream;

  mediaGenerator(state.rtcState.remoteStream, false, state);
  //user input for streams event listener
  events.streams(state);
}


function onDataChannelCreated(channel, state, events) {
  //data channel stuff
  channel.onopen = () => {

    // console.log('data channel onopen method triggered');

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

    //user input for onMessage event
    events.onMessage(state, dataObj);
  };
}

export {
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
};
