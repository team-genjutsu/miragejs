//allows inputs for client to hook DOM elements
//concerning filters. Preset filters for now, will be dynamic
//in future
// import {
// cutCircle,
// angularVelocity,
// velocity,
// drawVideo,
// setVendorCss,
// getCursorPosition,
// orbit,
// paste,
// bounce
// } from './funcStore';

function filterStore(filterDispId, filterBtnId) {
<<<<<<< HEAD
  return {
    currFilter: document.getElementById(filterDispId),
    filterBtn: document.getElementById(filterBtnId),
    filters: ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'],
    idx: 0,
    addFilter: (filterArr) => {
      if (filterArr != undefined || filterArr.length > 0) {
        filterArr.forEach((ele, idx) => {
          ele.push(filter);
        })
      }
    }
  }
}

function roomStore(url) {
  return {
    vendorUrl: url,
    chattersClient: [],
    chatterThisClient: null,
    roomID: null
  }
}

function mediaStore() {
  return {
    peerMedia: null,
    peerVideo: null,
    peerCanvas: null,
    peerContext: null,
    myMedia: null,
    myCanvas: null,
    myVideo: null,
    myContext: null
  }
}

function animeStore(animeBtnId, animeDispId, emojiClass, functionArray) {
  return {
    anime: {
      paste: functionArray[0], //paste,
      bounce: functionArray[1], //bounce,
      orbit: functionArray[2] //orbit
    },
    animeKeys: ['paste', 'bounce', 'orbit'],
    idx: 1,
    animeBtn: document.getElementById(animeBtnId),
    currAnime: document.getElementById(animeDispId),
    currentAnimation: null,
    temp: null,
    raf: null,
    rafObj: {},
    emoImg: new Image(),
    currentImg: null,
    emojis: [
    "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f385-1f3fb.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4a9.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4af.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f354.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f436.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f414.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f389.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f60d.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4b8.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f951.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f984.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/2705.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f64a.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f382.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f602.png",
     "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f64c.png"
    ],
    emoBtns: document.getElementsByClassName(emojiClass)
  }
}

function rtcStore() {
  return {
    sdpConstraints: {
      'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
      }
    },
    peerConn: null,
    isChannelReady: false,
    isInitiator: false,
    isStarted: false,
    localStream: null,
    remoteStream: null,
    turnReady: null,
    dataChannel: null,
    //stun server to use
    pcConfig: {
      'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
      }]
    }
  }
=======
  this.currFilter = document.getElementById(filterDispId);
  this.filterBtn = document.getElementById(filterBtnId);
  this.filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'];
  this.idx = 0;
  this.addFilters = (filterArr) => {
    if (filterArr != undefined || filterArr.length > 0) {
      filterArr.forEach((ele, idx) => {
        if(this.filters.indexOf(ele) < 0){
          this.filters.push(ele);
        }
      });
    }
  };
}

function roomStore(url) {
  this.vendorUrl = url;
  this.chattersClient = [];
  this.chatterThisClient = null;
  this.roomID = null;
}

function mediaStore(localBooth, remoteBooth) {
  this.peerBooth = document.getElementById(remoteBooth);
  this.peerMedia = null;
  this.peerVideo = null;
  this.peerCanvas = null;
  this.peerCanvasListeners = [];
  this.peerContext = null;
  this.myBooth = document.getElementById(localBooth);
  this.myMedia = null;
  this.myCanvas = null;
  this.myCanvasListeners = [];
  this.myVideo = null;
  this.myContext = null;
}

function animeStore(animeBtnId, animeDispId, emojiClass, functionArray) {
  this.anime = {
    paste: functionArray[0], //paste,
    bounce: functionArray[1], //bounce,
    orbit: functionArray[2] //orbit
  };
  this.animeKeys = ['paste', 'bounce', 'orbit'];
  this.idx = 1;
  this.animeBtn = document.getElementById(animeBtnId);
  this.currAnime = document.getElementById(animeDispId);
  this.currentAnimation = null;
  this.temp = null;
  this.raf = null;
  this.rafObj = {};
  this.emoImg = new Image();
  this.currentImg = null;
  this.emojis = ['https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4a9.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4af.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f354.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f436.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f414.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f389.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f60d.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4b8.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f951.png' 
     ];
  this.emojiSpillOver = [];
  this.addEmoji = (emojiArr) => {
    if (emojiArr != undefined || emojiArr.length > 0) {
      emojiArr.forEach( (ele, idx) => {
        if(this.emojis.length >= 9){
          this.emojiSpillOver.push(this.emojis.pop());
          this.emojis.unshift(ele);
        }
      });
    }
  };
  this.emoBtns = document.getElementsByClassName(emojiClass);
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
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
}

export {
  roomStore,
  filterStore,
  mediaStore,
  animeStore,
  rtcStore
<<<<<<< HEAD
}
=======
};
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
