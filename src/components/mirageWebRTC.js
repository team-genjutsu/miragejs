'use strict';

function connectEvents(rtcState, roomState, func1, func2, socket) {
<<<<<<< HEAD
  //console.log('connectEvent function: ' + rtcState);
  startSetup(rtcState, roomState, func1, socket);
  //data channel creation
  // console.log('init creating data channel')
  //create data channel
  rtcState.dataChannel = rtcState.peerConn.createDataChannel('interact');
  // console.log(state.dataChannel)
  // audio/video creation
  //console.log(rtcState.peerConn)
=======
  console.log('connectEvent function: ' + rtcState);
  startSetup(rtcState, roomState, func1, socket);
  //data channel creation

  //create data channel
  rtcState.dataChannel = rtcState.peerConn.createDataChannel('interact');
  // audio/video creation
  console.log(rtcState.peerConn);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  func2(rtcState.dataChannel);
  doCall(rtcState, roomState, socket);
}

function startSetup(rtcState, roomState, func, socket) {
<<<<<<< HEAD
  //console.log('startSetup? ', rtcState.isStarted, rtcState.localStream);
  if (!rtcState.isStarted && typeof rtcState.localStream !== 'undefined') {
    //console.log('creating peer connection')
=======
  console.log('startSetup? ', rtcState.isStarted, rtcState.localStream);
  if (!rtcState.isStarted && typeof rtcState.localStream !== 'undefined') {
    console.log('creating peer connection');
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    createPeerConnection(rtcState, roomState, func, socket);
    rtcState.peerConn.addStream(rtcState.localStream);
    rtcState.isStarted = true;
  }
}

function createPeerConnection(rtcState, roomState, func, socket) {
  try {
<<<<<<< HEAD
    rtcState.peerConn = new RTCPeerConnection(rtcState.pcConfig)
    rtcState.peerConn.onicecandidate = () => handleIceCandidate(event, roomState, socket);
    rtcState.peerConn.onaddstream = func //handleRemoteStreamAdded;
=======
    rtcState.peerConn = new RTCPeerConnection(rtcState.pcConfig);
    rtcState.peerConn.onicecandidate = () => handleIceCandidate(event, roomState, socket);
    rtcState.peerConn.onaddstream = func; //handleRemoteStreamAdded;
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
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
<<<<<<< HEAD
    //console.log('not initiator data channel start', event.channel);
    state.dataChannel = event.channel;
    func1(state.dataChannel);
    func2();
  }
=======
    console.log('not initiator data channel start', event.channel);
    state.dataChannel = event.channel;
    func1(state.dataChannel);
    func2();
  };
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
}

//misc webRTC helper functions

function sendMessage(data, who, state, socket) {
  let message = {
    roomID: state.roomID,
    who: who,
    data: data
<<<<<<< HEAD
  }
  //console.log('Client Sending Message: ', message);
=======
  };
  console.log('Client Sending Message: ', message);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  socket.emit('message', message);
}

function handleIceCandidate(event, roomState, socket) {
<<<<<<< HEAD
  //console.log('icecandidate event ', event);
=======
  console.log('icecandidate event ', event);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, 'other', roomState, socket);
  } else {
<<<<<<< HEAD
    //console.log('End of candidates.');
=======
    console.log('Finished adding candidates');
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  }
}

function handleIceConnStateChange(event, rtcState) {
  if (rtcState.peerConn.iceConnectionState === 'disconnected') {
    console.log('Disconnected');
    rtcState.peerConn.close();
<<<<<<< HEAD
    //console.log('iceConn state change remove rtc', rtcState.peerConn);
=======
    console.log('iceConn state change remove rtc', rtcState.peerConn);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
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
<<<<<<< HEAD
    setLocalAndSendMessage(result, rtcState, roomState, socket)
=======
    setLocalAndSendMessage(result, rtcState, roomState, socket);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  }).catch(err => {
    console.log('create offer error: ' + err);
  });
}

function doAnswer(rtcState, roomState, socket) {
  console.log('Sending answer to peer.');
  rtcState.peerConn.createAnswer().then((result) => {
<<<<<<< HEAD
    setLocalAndSendMessage(result, rtcState, roomState, socket)
=======
    setLocalAndSendMessage(result, rtcState, roomState, socket);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
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
