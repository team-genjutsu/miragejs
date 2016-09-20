
function animeStore(animeBtnId, animeDispId, emojiClass, functionArray) {
  this.anime = {
    paste: functionArray[0], //paste,
    bounce: functionArray[1], //bounce,
    orbit: functionArray[2] //orbit
  };
  this.animeKeys = ['paste', 'bounce', 'orbit'];
  this.idx = 1;
  this.animeBtn = document.getElementById(animeBtnId);
  this.currAnime = document.getElementById(animeDispId);
  this.currentAnimation = null;
  this.temp = null;
  this.raf = null;
  this.rafObj = {};
  this.emoImg = new Image();
  this.currentImg = null;
  this.emojis = ['https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4a9.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4af.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f354.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f436.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f414.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f389.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f60d.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4b8.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f951.png'
     ];
  this.emojiSpillOver = [];
  this.addEmoji = (emojiArr) => {
    if (emojiArr != undefined || emojiArr.length > 0) {
      emojiArr.forEach( (ele, idx) => {
        if(this.emojis.length >= 9){
          this.emojiSpillOver.push(this.emojis.pop());
          this.emojis.unshift(ele);
        }
      });
    }
  };
  this.emoBtns = document.getElementsByClassName(emojiClass);
}

function filterStore(filterDispId, filterBtnId) {
  this.currFilter = document.getElementById(filterDispId);
  this.filterBtn = document.getElementById(filterBtnId);
  this.filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'];
  this.idx = 0;
  this.addFilters = (filterArr) => {
    if (filterArr != undefined || filterArr.length > 0) {
      filterArr.forEach((ele, idx) => {
        if(this.filters.indexOf(ele) < 0){
          this.filters.push(ele);
        }
      });
    }
  };
}

export {
  filterStore,
  animeStore
};
