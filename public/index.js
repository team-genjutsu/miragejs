import { Mirage } from './../src/index';
import { domReady } from './../src/components/domReady';

// wait for dom to load
domReady(() => {

  // instantiate mirage object
  const mirage = new Mirage();

  mirage.insertCss(); //mount styles on DOM for component

  mirage.insertChunk(); // mount mirage chunk on DOM

  mirage.on('preStream', (state) => {
    console.log('preStream test', state);
  });

  mirage.on('localStream', (state) => {
    console.log('localStream test', state);
  });

  mirage.on('streams', (state) => {
    console.log('streams trigger', state);
  });

  mirage.on('onData', (state) => {
    // console.log(state);
    // state.rtcState.dataChannel.send(JSON.stringify({onData: "yo you're up in the data channels"}));
  });

  mirage.on('onMessage', (state, data) => {
    // console.log('onMessage', state);
    if(data.hasOwnProperty('dataObj')){
      console.log(data.dataObj);
    } 
  });

  mirage.putFilters = []; //add filters
  mirage.putImages = []; //add images

  mirage.startApp(); // start mirage logic


});
