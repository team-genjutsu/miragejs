import {
  insertCss,
  insertHtml
} from './components/insertFunctions';

import {
  mirageApp
} from './components/mirageApp';

import {
  beginMirage
} from './components/beginMirage';

export function Mirage() {

  this.putFilters = null;
  this.putImages = null;
  
  this.events = {
    stream: null,
    onMessage: null,
    onData: null
  };

  this.on = (event, func) => {
    this.events[event] = func;
  };

  this.insertCss = insertCss;
  this.insertChunk = insertHtml;

  this.startApp = () => {
    mirageApp(this.putFilters, this.putImages, this.events);
  };

  this.beginMirage = () => {
    beginMirage(); 
  };
}
