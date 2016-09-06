'use strict';

function connectEvents(rtcState, roomState, func1, func2, socket) {
  console.log('connectEvent function: ' + rtcState);
  startSetup(rtcState, roomState, func1, socket);
  //data channel creation
  // console.log('init creating data channel')
  //create data channel
  rtcState.dataChannel = rtcState.peerConn.createDataChannel('interact');
  // console.log(state.dataChannel)
  // audio/video creation
  console.log(rtcState.peerConn)
  func2(rtcState.dataChannel);
  doCall(rtcState, roomState, socket);
}

function startSetup(rtcState, roomState, func, socket) {
  console.log('startSetup? ', rtcState.isStarted, rtcState.localStream);
  if (!rtcState.isStarted && typeof rtcState.localStream !== 'undefined') {
    console.log('creating peer connection')
    createPeerConnection(rtcState, roomState, func, socket);
    rtcState.peerConn.addStream(rtcState.localStream);
    rtcState.isStarted = true;
  }
}

function createPeerConnection(rtcState, roomState, func, socket) {
  try {
    rtcState.peerConn = new RTCPeerConnection(rtcState.pcConfig)
    rtcState.peerConn.onicecandidate = () => handleIceCandidate(event, roomState, socket);
    rtcState.peerConn.onaddstream = func //handleRemoteStreamAdded;
    rtcState.peerConn.onremovestream = handleRemoteStreamRemoved;
    rtcState.peerConn.oniceconnectionstatechange = () => handleIceConnStateChange(event, rtcState);
  } catch (err) {
    console.log('Failed to connect. Error: ' + err);
    return;
  }
}


//big gap between functions
//onDataChannelCreated is usually situated here, it's living in main
//index.js file right now because it's sheer enormity

function otherDataChannel(event, state, func1, func2) {
  state.peerConn.ondatachannel = (event) => {
    console.log('not initiator data channel start', event.channel);
    state.dataChannel = event.channel;
    func1(state.dataChannel);
    func2();
  }
}

//misc webRTC helper functions

function sendMessage(data, who, state, socket) {
  let message = {
    roomID: state.roomID,
    who: who,
    data: data
  }
  console.log('Client Sending Message: ', message);
  socket.emit('message', message);
}

function handleIceCandidate(event, roomState, socket) {
  console.log('icecandidate event ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, 'other', roomState, socket);
  } else {
    console.log('End of candidates.');
  }
}

function handleIceConnStateChange(event, rtcState) {
  if (rtcState.peerConn.iceConnectionState === 'disconnected') {
    console.log('Disconnected');
    rtcState.peerConn.close();
    console.log('iceConn state change remove rtc', rtcState.peerConn);
  }
}

//another gap, handleRemoteStreamAdded function usually lives here,
//it has a lot of depended functions in it right now


function handleRemoteStreamRemoved(event) {
  console.log('Remote Stream removed, event: ', event);
  // socket.emit('disconnect');
  // location.reload();
}

function doCall(rtcState, roomState, socket) {
  console.log('sending offer to peer', 'state in doCall: ' + rtcState.peerConn);
  rtcState.peerConn.createOffer().then( (result) => {
    setLocalAndSendMessage(result, rtcState, roomState, socket)
  }).catch(err => {
    console.log('create offer error: ' + err);
  });
}

function doAnswer(rtcState, roomState, socket) {
  console.log('Sending answer to peer.');
  rtcState.peerConn.createAnswer().then((result) => {
    setLocalAndSendMessage(result, rtcState, roomState, socket)
  }).catch(err => {
    console.log('create offer error: ' + err);
  });
}


function setLocalAndSendMessage(sessionDescription, rtcState, roomState, socket) {
  rtcState.peerConn.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage. Sending Message', sessionDescription);
  sendMessage(sessionDescription, 'other', roomState, socket);
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
