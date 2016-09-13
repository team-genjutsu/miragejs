import {
  createMirage
} from './../src/index';
import {
  domReady
} from './../src/components/domReady';

domReady(() => {

  const mirage = createMirage();

  //mount styles on DOM for component
  mirage.insertCss();

  // mount mirage chunk on DOM
  mirage.insertChunk();
  
  mirage.on('stream', (state) => {
    console.log(state);
  });

  mirage.on('onData', (state) => {
    console.log(state);
  });

  mirage.on('onMessage', (state) => {
    console.log(state);
  });

  // start mirage logic
  mirage.startApp();

});
