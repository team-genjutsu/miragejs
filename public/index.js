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


  mirage.localStreamStore([{
    locStreamOutput: function(state) {
      console.log('local stream event Im in it', state);
    }
  }]);

  mirage.remoteStreamStore([{
    locStreamOutput: function(state) {
      console.log('remote stream event Im in it', state);
    }
  }]);


  mirage.onMessageDataStore([{
    locStreamOutput: function(state) {
      console.log('onMessage event Im in it', state);
    }
  }]);

  mirage.onOpenDataStore([{
    output: function(state) {
      console.log('onData event Im in it', state);
    }
  }]);
  // start mirage logic
  mirage.startApp();


});
