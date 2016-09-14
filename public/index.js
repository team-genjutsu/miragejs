import { createMirage } from './../src/index';
import { domReady } from './../src/components/domReady';

// wait for dom to load
domReady(() => {

  // instantiate mirage object
  const mirage = createMirage();

  // mount styles on DOM for component
  mirage.insertCss();

  // mount mirage chunk on DOM
  mirage.insertChunk();

  // start mirage logic
  mirage.startApp();

});
