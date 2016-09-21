
function roomStore(url) {
  this.vendorUrl = url;
  this.chattersClient = [];
  this.chatterThisClient = null;
  this.roomID = null;
  this.startMedia = false;
}

function mediaStore(localBooth, remoteBooth) {
  this.peerBooth = document.getElementById(remoteBooth);
  // this.peerMedia = null;
  this.peerVideo = null;
  this.peerCanvas = null;
  // this.peerCanvasListeners = [];
  this.peerContext = null;
  this.myBooth = document.getElementById(localBooth);
  // this.myMedia = null;
  this.myCanvas = null;
  // this.myCanvasListeners = [];
  this.myVideo = null;
  this.myContext = null;
}


function rtcStore() {
  this.sdpConstraints = {
    'mandatory': {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    }
  };
  this.peerConn = null;
  this.isChannelReady = false;
  this.isInitiator = false;
  this.isStarted = false;
  this.localStream = null;
  this.remoteStream = null;
  this.turnReady = null;
  this.dataChannel = null;
    //stun server to use
  this.pcConfig = {
    'iceServers': [{
      //public stun server to use, change to local if preferred
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      //public turn server to use, change to local if preferred
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    }]
  };
}

function elementStore(idArray){
  this.joinId = idArray[0];
  this.connectId = idArray[1];
  this.disconnectId = idArray[2];
  this.roomInputId = idArray[3];
  this.localBoothId = idArray[4];
  this.localVidId = idArray[5];
  this.localCanvasId = idArray[6];
  this.remoteBoothId = idArray[7];
  this.remoteVidId = idArray[8];
  this.remoteCanvasId = idArray[9];
  this.joinButton = document.getElementById(this.joinId);
  this.connectElement = document.getElementById(this.connectId);
  this.disconnectElement = document.getElementById(this.disconnectId);
}

export {
  roomStore,
  mediaStore,
  rtcStore,
  elementStore
};
