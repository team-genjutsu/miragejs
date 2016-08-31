'use strict';
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


function Mirage(){

  const mirageObj = {};


  mirageObj.stores = [
    roomStore,
    filterStore,
    mediaStore,
    animeStore,
    rtcStore
  ];
  //initiate webRTC
  //video and canvas setup  
  
  //initiate messaging

  //initiate room function
  //server needs to be initiated first

  //initiate filter option

  //initiate emojis
  
  //initiate animations
  
  //initiate tracking

}






export default { Mirage };
