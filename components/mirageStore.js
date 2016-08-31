//allows inputs for client to hook DOM elements
//concerning filters. Preset filters for now, will be dynamic
//in future
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
} from './funcStore';

function filterStore(btnEle, dispEle){
  return {
    currFilter: dispEle,
    filterBtn: btnEle,
    filters: ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'],
    idx: 0
  }
}

function roomStore(url){
  return {
    vendorUrl: url,
    chattersClient: [],
    chatterThisClient: null,
    roomID: null
  }
}

function mediaStore(){
  return {
    peerMedia: null,
    peerVideo: null,
    peerCanva: null,
    peerContex: null,
    myMedia: null,
    myCanvas: null,
    myVideo: null,
    myContext: null
  }
}

function animeStore(animeBtn, animeDisp, emojiEls){
  return {
    anime: {
      paste: paste,
      bounce: bounce,
      orbit: orbit
    },
    animeKeys: ['paste', 'bounce', 'orbit'],
    idx: 1,
    animeBtn: animeBtn,
    currAnime: animeDisp,
    currentAnimation: null,
    temp: null,
    raf: null,
    emoImg: new Image(),
    currentImg: null,
    emojis: emojiEls
  }
}

function rtcStore(){
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

export { roomStore, filterStore, mediaStore, animeStore, rtcStore }
