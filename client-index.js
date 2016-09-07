'use strict';

import {
  createMirage
} from './index.js';

import {
  domReady
} from './components/domReady';

function initMirage() {

  const mirageObj = {};

  mirageObj.begin = createMirage();

  //require mirage-js in server, then input your server in the
  //socket call in initMirage().socket(),  
  // mirageObj.sockit = require('./sockLogic.js');

  // mirageObj.stores = [
  // roomStore,
  // filterStore,
  // mediaStore,
  // animeStore,
  // rtcStore
  // ];

  //should probably make click listener arrays for each event,
  //which can take listeners within particular rtc events/functions

  //initiate webRTC
  //video and canvas setup  

  //initiate messaging

  //initiate room function
  //server needs to be initiated first

  //initiate filter option

  //initiate emojis

  //initiate animations

  //initiate tracking

  return mirageObj;
}

domReady(function() {

  const mirage = initMirage().begin;

  //mount mirage chunk on DOM
  mirage.insertChunk();

  //start mirage logic
  mirage.startApp();

});
// export default { Mirage };
