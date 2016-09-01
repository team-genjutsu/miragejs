function connectEvents(state, func1, func2) {
  console.log(state);
  startSetup(state, func1);
  //data channel creation
  // console.log('init creating data channel')
  //create data channel
  state.dataChannel = state.peerConn.createDataChannel('interact');
  // console.log(state.dataChannel)
  // audio/video creation
  console.log(state)
  func2(state.dataChannel);
  doCall(state);
  // onDataChannelCreated(state.dataChannel)
}

function startSetup(state, func) {
  console.log('startSetup? ', state.isStarted, state.localStream);
  if (!state.isStarted && typeof state.localStream !== 'undefined') {
    console.log('creating peer connection')
    createPeerConnection(state, func);
    state.peerConn.addStream(state.localStream);
    state.isStarted = true;
  }
}

function createPeerConnection(state, func) {
  try {
    state.peerConn = new RTCPeerConnection(state.pcConfig)
    state.peerConn.onicecandidate = handleIceCandidate;
    state.peerConn.onaddstream = func //handleRemoteStreamAdded;
    state.peerConn.onremovestream = handleRemoteStreamRemoved;

  } catch (err) {
    console.log('Failed to connect. Error: ' + err);
    return;
  }
}


//big gap between functions


function otherDataChannel(event, state) {
  state.peerConn.ondatachannel = (event) => {
    console.log('not initiator data channel start', event.channel);
    state.dataChannel = event.channel;
    onDataChannelCreated(state.dataChannel);
  }
}

//misc webRTC helper functions

function sendMessage(data, who, state = roomState) {
  let message = {
    roomID: state.roomID,
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


//another gap


function handleRemoteStreamRemoved(event) {
  console.log('Remote Stream removed, event: ', event);
  // socket.emit('disconnect');
  // location.reload();
}

function doCall(state) {
  console.log('sending offer to peer', 'state: ' + state);
  state.peerConn.createOffer().then(setLocalAndSendMessage).
  catch(err => {
    console.log('create offer error: ' + err);
  });
}

function doAnswer(state) {
  console.log('Sending answer to peer.');
  state.peerConn.createAnswer().then(
    setLocalAndSendMessage).catch(err => {
    console.log('create offer error: ' + err);
  });
}


function setLocalAndSendMessage(sessionDescription, state) {
  state.peerConn.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage. Sending Message', sessionDescription);
  sendMessage(sessionDescription, 'other');
} //close misc webRTC helper function

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
  setLocalAndSendMessage
};
