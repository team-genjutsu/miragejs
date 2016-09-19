import {
  Mirage
} from './../src/index';
import {
  domReady
} from './../src/components/domReady';

import {
  filterListener,
  animationListener,
  clearListener,
  myTrackingListener,
  peerTrackingListener
} from './../src/components/listenerFuncs';

import {
  receivedAnimation,
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  getCursorPosition,
  orbit,
  paste,
  bounce,
  trackFace,
  hat
} from './../src/components/funcStore';

import {
  disableToggle,
  hiddenToggle,
  setVendorCss,
  toggleVidSize,
  toggleZindex,
  clearFunc,
  removeChildren,
  resizeMedia,
  setSizes,
  generateDims,
  vidDims,
  classToggle,
  appendConnectButtons
} from './../src/components/domFunctions';

import {
  mediaGenerator
} from './../src/components/mediaGenerator';

import {
  elementStore,
  mediaStore,
  filterStore,
  animeStore
} from './../src/components/mirageStore';

require('./../src/components/tracking');

// wait for dom to load
domReady(() => {

  // instantiate mirage object
  const mirage = new Mirage();

  mirage.insertCss(); //mount styles on DOM for component

  mirage.insertChunk(); // mount mirage chunk on DOM

  
  ///beginning of manipulation/event access methods///
  //manipulation at beginning of mirage process
  mirage.on('initial', (state) => {

    state.elementState.materialBtn.addEventListener('click', () => {
      // need to parse through stylesheets and set z-indexes of elements to -1 with
      // each toggle
      state.elementState.demo.classList.toggle('MRGhidden');
      toggleZindex();
    });

    state.elementState.materialBtn.addEventListener('drag', (event) => {
      // console.log(event);
    });

    state.elementState.materialBtn.addEventListener('dragend', (event) => {
      // console.log('drag over', event.clientX);
      state.elementState.materialBtn.style.left = event.clientX + 'px';
      state.elementState.materialBtn.style.top = (event.clientY - 60) + 'px';
    });
  });


  //manipulation right before MediaDevices process starts
  mirage.on('preStream', (state, filters, images) => {

    state.mediaState = new mediaStore('MRGmyBooth', 'MRGpeerBooth');
    state.filterState = new filterStore('MRGfilterDisp', 'MRGfilter');
    state.animeState = new animeStore('MRGanimation', 'MRGanimateDisp', 'MRGemoji', [paste, bounce, orbit]);


    //add input filters or images
    state.filterState.addFilters(filters);
    state.animeState.addEmoji(images);

    appendConnectButtons(state);

    state.animeState.emojis.forEach((ele, idx) => {
      let btn = document.createElement('button');
      btn.classList.add('MRGemojibtn');
      btn.classList.add('MRGemoji');
      let emoj = document.createElement('img');
      emoj.src = ele;
      emoj.style.height = '25px';
      emoj.style.width = '25px';
      btn.appendChild(emoj);
      document.getElementById('MRGemojiButtons').appendChild(btn);
    });

    hiddenToggle('MRGroomApp', 'MRGboothApp');

    state.elementState.boothComponent.addEventListener('drag', (event) => {

    });

    state.elementState.boothComponent.addEventListener('dragend', (event) => {
      state.elementState.fixedComponent.style.left = event.clientX + 'px';
      state.elementState.fixedComponent.style.top = event.clientY + 'px';
    });
  });


  //manipulation immediately after local stream becomes available
  mirage.on('localStream', (state) => {
    console.log('localStream test', state);
  });


  //manipulation right after remote stream becomes available
  mirage.on('streams', (state) => {

    mediaGenerator(state.rtcState.remoteStream, false, state, 'MRGpeerBooth', 'MRGpeerVideo', 'MRGpeerCanvas');

    state.mediaState.peerCanvas.classList.add('MRGpointerToggle');

    toggleVidSize(window, state.mediaState, generateDims, vidDims, classToggle, setSizes);

    hiddenToggle('MRGconnect', 'MRGdisconnect');
  });


  //manipulation right after data channel becomes available
  mirage.on('onData', (state) => {

    animationListener(state.mediaState.peerCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.peerContext, state.animeState.raf, [velocity, angularVelocity], state.rtcState.dataChannel, false, getCursorPosition, state.animeState.rafObj); //remote

    animationListener(state.mediaState.myCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.myContext, state.animeState.raf, [velocity, angularVelocity], state.rtcState.dataChannel, true, getCursorPosition, state.animeState.rafObj); //local

    filterListener(state.mediaState.myVideo, 'MRGmyFilter', state.filterState.currFilter, true, state.rtcState.dataChannel, setVendorCss);

    filterListener(state.mediaState.peerVideo, 'MRGpeerFilter', state.filterState.currFilter, false, state.rtcState.dataChannel, setVendorCss);

    clearListener(state.rtcState.dataChannel, clearFunc, state.elementState.clearButton, state.animeState, state.mediaState);

    myTrackingListener(state.mediaState.myVideo, state.mediaState.myCanvas, state.mediaState.myContext, state.animeState.emoImg, tracking, state.rtcState.dataChannel);

    peerTrackingListener(state.mediaState.peerVideo, state.mediaState.peerCanvas, state.mediaState.peerContext, state.animeState.emoImg, state.rtcState.dataChannel, trackFace, tracking, state.rtcState.remoteStream);

    document.getElementById('MRGvideoToggle').addEventListener('click', () => {
      toggleVidSize(window, state.mediaState, generateDims, vidDims, classToggle, setSizes);
    });

    // changing this because the multi event listener is retogglei
    disableToggle('MRGconnect', 'MRGdisconnect');

    window.onresize = () => {
      resizeMedia(window, state.mediaState, document.getElementById('MRGvidContainer'), generateDims, vidDims, setSizes);
    };

    //changing filters//
    state.filterState.filterBtn.addEventListener('click', () => {
      state.filterState.currFilter.innerHTML = state.filterState.filters[state.filterState.idx++];
      if (state.filterState.idx >= state.filterState.filters.length) state.filterState.idx = 0;
    }, false); //end of filter test//

    //changing animations//
    state.animeState.animeBtn.addEventListener('click', () => {
      state.animeState.currAnime.innerHTML = state.animeState.animeKeys[state.animeState.idx];
      state.animeState.currentAnimation = state.animeState.anime[state.animeState.animeKeys[state.animeState.idx++]];
      if (state.animeState.idx >= state.animeState.animeKeys.length) state.animeState.idx = 0;
    }, false);

    //adding click handler for active emoji selection
    Array.from(state.animeState.emoBtns, (ele) => {
      ele.addEventListener('click', (event) => {
        state.animeState.currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
        state.animeState.emoImg.src = state.animeState.currentImg;
      }, false);
    });
  });


  //manipulation on receipt of data through data channel
  mirage.on('onMessage', (state, dataObj) => {

    if (dataObj.hasOwnProperty('filter')) {
      if (dataObj.filter) {
        setVendorCss(state.mediaState.peerVideo, dataObj.filterType);
      } else {
        setVendorCss(state.mediaState.myVideo, dataObj.filterType);
      }
    }

    if (dataObj.hasOwnProperty('localEmoji')) {
      if (dataObj.localEmoji) {
        //remote display bounce animation!

        receivedAnimation(false, state.animeState, state.mediaState, event, dataObj, velocity, angularVelocity);
      } else if (!dataObj.localEmoji) {
        //local display bounce animation!

        receivedAnimation(true, state.animeState, state.mediaState, event, dataObj, velocity, angularVelocity);
      }
    }

    if (dataObj.hasOwnProperty('tracking')) {
      state.mediaState.myContext.clearRect(0, 0, state.mediaState.myCanvas.width, state.mediaState.myCanvas.height);

      if (dataObj.tracking === 'yes') {
        state.mediaState.myContext.clearRect(0, 0, state.mediaState.myCanvas.width, state.mediaState.myCanvas.height);
        var emoji = new Image();
        emoji.src = dataObj.image;
        // console.log(emoji);
        //console.log(dataObj.faceRect);
        var adjustedRect = {
          x: dataObj.faceRect.x,
          y: dataObj.faceRect.y,
          width: dataObj.faceRect.width / 2,
          height: dataObj.faceRect.height / 2
        };
        hat(state.mediaState.myCanvas, state.mediaState.myContext, adjustedRect, emoji);
      }

    }

    if (dataObj.hasOwnProperty('myTrack')) {
      if (dataObj.myTrack === state.mediaState.myVideo) {
        //console.log("track me fired off");
        var myEmoji = new Image();
        myEmoji.src = dataObj.image;
        var tracking = dataObj.tracking;
        var channel = dataObj.channel;
        trackFace(state.mediaState.peerCanvas, state.mediaState.peerContext, tracking, state.rtcState.remoteStream, myEmoji, channel);
      }
    }

    if (dataObj.type === 'clear') {
      clearFunc(state.animeState, state.mediaState);
    }

  });


  //manipulation of nonInitializer client logic when data channel
  //becomes available for them
  mirage.on('nonInitiatorData', (state) => {
  
    animationListener(state.mediaState.peerCanvas, state.animeState.emoImg, state.animeState.anime, state.animeState.currAnime, state.mediaState.peerContext, state.animeState.raf, [velocity, angularVelocity], state.rtcState.dataChannel, false, getCursorPosition, state.animeState.rafObj);

  });
  ///end of event access methods///

  mirage.putFilters = []; //add filters
  mirage.putImages = []; //add images

  mirage.startApp(); // start mirage logic


});
