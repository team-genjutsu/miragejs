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
    emojis: ["http://emojione.com/wp-content/uploads/assets/emojis/1f916.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f453.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f47b.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f480.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f42a.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f415.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f98d.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f429.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f490.svg", "http://emojione.com/wp-content/uploads/assets/emojis/2604.svg", "http://emojione.com/wp-content/uploads/assets/emojis/1f988.svg"],
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
}

export {
  roomStore,
  filterStore,
  mediaStore,
  animeStore,
  rtcStore
}
