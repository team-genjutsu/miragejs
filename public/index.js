import {
  createMirage
} from './../src/index';
import {
  domReady
} from './../src/components/domReady';

domReady(() => {

  const mirage = createMirage();

  mirage.insertCss(); //mount styles on DOM for component

  mirage.insertChunk(); // mount mirage chunk on DOM
  
  mirage.on('stream', (state) => {
    // console.log(state);
  });

  mirage.on('onData', (state) => {
    // console.log(state);
    // state.rtcState.dataChannel.send(JSON.stringify({onData: "yo you're up in the data channels"}));
  });

  mirage.on('onMessage', (state) => {
    // console.log(state);
    if(state.hasOwnProperty('dataMsg')){
      // console.log(state.dataMsg);
    } 
  });

  mirage.putFilters = []; //add filters
  mirage.putImages = []; //add images

  mirage.startApp(); // start mirage logic


});
