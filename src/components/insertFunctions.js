import {
  cssChunk
} from './cssChunk';
import {
  mirageChunk  
} from './chunk';

function insertCss(){
  document.head.insertAdjacentHTML('beforeend', cssChunk);
}

function insertHtml(){
  document.body.insertAdjacentHTML('afterbegin', mirageChunk);
}

export {
  insertCss,
  insertHtml
};
