import {
  insertCss,
  insertHtml
} from './components/insertFunctions';

import {
  mirageApp
} from './components/mirageApp';


export function Mirage() {

  this.domIds = null;

  this.state = {};

  this.events = {};

  Object.defineProperties(this.events, {
    'initial': {
      value: null,
      writable: true
    },
    'preStream': {
      value: null,
      writable: true
    },
    'localStream': {
      value: null,
      writable: true
    },
    'readyConnect': {
      value: null,
      writable: true
    },
    'connectTriggered': {
      value: null,
      writable: true
    },
    'streams': {
      value: null,
      writable: true
    },
    'onMessage': {
      value: null,
      writable: true
    },
    'onData': {
      value: null,
      writable: true
    },
    'nonInitiatorData': {
      value: null,
      writable: true
    },
    'end': {
      value: null,
      writable: true
    }
  });

  Object.preventExtensions(this.events);

  this.on = (event, func) => {
    if (this.events.hasOwnProperty(event)) {
      this.events[event] = func;
    }
  };

  //methods for mirage component usage, very opinionated//
  this.insertCss = insertCss;
  this.insertChunk = insertHtml;
  //end opinions//

  this.startApp = () => {
    mirageApp(this.events, this.state, this.domIds);
  };

}
