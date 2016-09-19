import {
  insertCss,
  insertHtml
} from './components/insertFunctions';

import {
  mirageApp
} from './components/mirageApp';

import {
  roomStore,
  filterStore,
  mediaStore,
  animeStore,
  rtcStore,
  elementStore
} from './components/mirageStore';

export function Mirage() {

  this.putFilters = null;
  this.putImages = null;
  this.state = {
    roomState: new roomStore(window.URL),
    rtcState: new rtcStore()
  };
  
  this.events = {
    // stream: null,
    // onMessage: null,
    // onData: null
  };

  this.on = (event, func) => {
    this.events[event] = func;
  };

  //methods for mirage component usage, very opinionated//
  this.insertCss = insertCss;
  this.insertChunk = insertHtml;
  //end opinions//

  this.startApp = () => {
    mirageApp(this.putFilters, this.putImages, this.events, this.state);
  };
  
}
