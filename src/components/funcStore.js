//function store//

function bounce(cv, ctx, evt, pos, emoImg, animate, array, rafObj) {
  let onload = emoImg.onload;
  //this object keeps track of the movement, loads the images, and determines
  //the velocity
<<<<<<< HEAD
=======
  let dim = 50;
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  let emoticon = {
    x: pos.x,
    y: pos.y,
    vx: 5,
    vy: 2,
    onload: function() {
<<<<<<< HEAD
      ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
=======
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    }
  };
  //initial image load on canvas
  emoticon.onload();
  let callBack = function() {
    array[0](emoticon, ctx, cv, callBack, emoImg, animate, rafObj, evt);
  };
  //start drawing movement
  animate = requestAnimationFrame(callBack);
  //put evt timestamp as key and update val with most recent raf id from velocity vunction
  rafObj[evt.timeStamp.toString()] = animate;
} //end bounce//

function paste(cv, ctx, evt, pos, emoImg) {
  let onload = emoImg.onload;
  //this object keeps track of the movement, loads the images, and determines
  //the velocity
<<<<<<< HEAD
=======
  let dim = 50;
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  let emoticon = {
    x: pos.x,
    y: pos.y,
    vx: 5,
    vy: 2,
    onload: function() {
<<<<<<< HEAD
      ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
=======
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    }
  };
  //initial image load on canvas
  emoticon.onload();
} //end staticPaste//

//orbit func//
function orbit(cv, ctx, evt, pos, emoImg, animate, array, rafObj) {
  let onload = emoImg.onload;
  //this object keeps track of the movement, loads the images, and determines
  //the angular veloctiy. We're keeping track of frequency of refreshes to
  //imcrement the degrees
<<<<<<< HEAD
=======
  let dim = 50;
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  let movement = .0349066;
  let emoticon = {
    x: pos.x,
    y: pos.y,
    r: 5,
    rotateCount: 1,
    wx: movement,
    wy: movement,
    onload: function() {
<<<<<<< HEAD
      ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
=======
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    }
  };
  //initial image load on canvas
  emoticon.onload();
  let callBack = function() {
    array[1](emoticon, ctx, cv, callBack, emoImg, animate, rafObj, evt);
  };
  animate = requestAnimationFrame(callBack);
  //put evt timestamp as key and update val with most recent raf id from angularVelocity vunction
  rafObj[evt.timeStamp.toString()] = animate;

} //end velocity//

<<<<<<< HEAD
function trackFace(video, canvas, context, trackingObj, videoStream, img, channel) {
  //console.log("data channel", channel);

  var video = video;
  var canvas = canvas;
  var context = context;
  //console.log("tracking object", trackingObj);
  var emoji = new Image();
  if (img.src === undefined) {
    emoji.src = img;
  } else {
    emoji.src = img.src;
  }
  console.log(emoji);
  var tracker = new trackingObj.ObjectTracker('face');
  tracker.canvasOverlay = canvas;
  var faceRect = {x: 100, y: 100, width: emoji.width * 3, height: emoji.height * 3};

  //console.log('face track has been called');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracker.canvasOverlay = canvas;
  tracker.canvasContext = context;

  // if(isTrackingBool) {

  trackingObj.track(video, tracker, {camera: true});
  tracker.on('track', function(event) {
    context.clearRect(faceRect.x - 50, faceRect.y - img.height * 3 - 50, faceRect.width + 50, faceRect.height + img.width * 3 + 50);
    //mediaState.myContext.clearRect
    event.data.forEach(function(rect) {
      //console.log("rect", rect, "emoji", emoji);
      faceRect.x = rect.x;
      faceRect.y = rect.y;
      hat(canvas, context, faceRect, emoji);

      let trackingDataObj = JSON.stringify({
        tracking: 'yes',
        image: emoji.src,
        faceRect: faceRect
      });
      channel.send(trackingDataObj);
    });
  });
}

// var pastRect = (function() {
//   var store = {x:0, y:0, width: 100, height: 100};
//   function rememberFace(rect) {
//     store.x = rect.x;
//     store.y = rect.y;
//     store.width = rect.width;
//     store.height = rect.height;
//   }
//   return {
//     previous: function() {
//       console.log("store inside of previous", store);
//       return store;
//     },
//     updateStore: function(faceRect) {
//       console.log("store was updated");
//       rememberFace(faceRect);
//     }
//   };
// })();

function hat(cv, ctx, rect, img) {
    //console.log("rect in hat", rect, "cv in hat", cv);
  ctx.clearRect(0, 0, 20000, 20000);
  ctx.drawImage(img, rect.x, rect.y - 5, rect.height, rect.width);

}

=======
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
//doesnt work yet, but would provide a way to erase drawn
//objects in circular fashion rather than rectangular
function cutCircle(context, x, y, radius) {
  context.globalCompositeOperation = 'destination-out';
  context.arc(x, y, radius, 0, Math.PI * 2, true);
  context.fill();
} //end cutCircle//

//these functions need to be ported to proper file
function hiddenToggle(ele1, ele2) {
  let args = [...arguments];
  args.forEach((ele, idx) => {
    let tag = document.getElementById(ele);
    if (tag.classList.contains('MRGhidden')) {
<<<<<<< HEAD
      tag.classList.toggle('MRGhidden');
=======
      tag.classList.remove('MRGhidden');
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    } else {
      tag.classList.add('MRGhidden');
    }
  });
}


//paste object to canvas
// function pasteImg(video, context, width, height, x, y, source) {
<<<<<<< HEAD
  // context.drawImage(video, 0, 0, width, height);
  // baseImg = new Image();
  // baseImg.src = source; // needs to be path ie --> 'assets/weird.png';
  // baseImg.onload = function() {
    // context.drawImage(baseImg, x - baseImg.width / 2, y - baseImg.height / 2);
    //setTimeout for pasted images//
    // var time = window.setTimeout(function() {
    // context.clearRect(x - baseImg.width / 2, y - baseImg.height / 2, baseImg.width, baseImg.height);
    // }, 5000);
  // }
=======
// context.drawImage(video, 0, 0, width, height);
// baseImg = new Image();
// baseImg.src = source; // needs to be path ie --> 'assets/weird.png';
// baseImg.onload = function() {
// context.drawImage(baseImg, x - baseImg.width / 2, y - baseImg.height / 2);
//setTimeout for pasted images//
// var time = window.setTimeout(function() {
// context.clearRect(x - baseImg.width / 2, y - baseImg.height / 2, baseImg.width, baseImg.height);
// }, 5000);
// }
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
// } //end paste//

function disableToggle(ele1, ele2) {

  let args = [...arguments];
  args.forEach((ele, idx) => {
    document.getElementById(ele).disabled ? document.getElementById(ele).disabled = false : document.getElementById(ele).disabled = true;
  });
}

//gets cursor position upon mouse click that places
//an object or starts object movement
function getCursorPosition(canvas, event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  let pos = {
    x: x,
    y: y
  };
  return pos;
} //end getCursorPosition//

//streamline vendor prefixing for css filtering
function setVendorCss(element, style) {
  element.style.webkitFilter = style;
  element.style.mozFilter = style;
  element.style.filter = style;
} //end setVendorCss //

//draws video on canvas
function drawVideo(v, c, w, h) {
  if (v.paused || v.ended) return false;
  c.drawImage(v, 0, 0, w, h);
  setTimeout(drawVideo, 20, v, c, w, h);
} //end drawVideo//

//canvas draw function for velocity motion
function velocity(obj, ctx, cv, cb, emoImg, animate, rafObj, evt) {
  ctx.clearRect(obj.x - emoImg.width / 2 - 5, obj.y - emoImg.height / 2 - 5, emoImg.width + 8, emoImg.height + 8);
  obj.onload();
  obj.x += obj.vx;
  obj.y += obj.vy;
  if (obj.y + obj.vy > cv.height || obj.y + obj.vy < 0) {
    obj.vy = -obj.vy;
  }
  if (obj.x + obj.vx > cv.width || obj.x + obj.vx < 0) {
    obj.vx = -obj.vx;
  }
  animate = window.requestAnimationFrame(cb);
  //update the raf of latest draw of velocity recursive call for clearing purposes
  rafObj[evt.timeStamp.toString()] = animate;

} //end velocity//

<<<<<<< HEAD

=======
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
//angularVelocity func//
function angularVelocity(obj, ctx, cv, cb, emoImg, animate, rafObj, evt) {
  ctx.clearRect(obj.x - emoImg.width / 2 - 5, obj.y - emoImg.height / 2 - 5, emoImg.width + 10, emoImg.height + 10);
  obj.onload();

  obj.x += Math.sin(obj.wx * obj.rotateCount) * obj.r;
  obj.y += Math.cos(obj.wy * obj.rotateCount) * obj.r;
  obj.rotateCount++;

  animate = window.requestAnimationFrame(cb);
  //update the raf of latest draw of velocity recursive call for clearing purposes
  rafObj[evt.timeStamp.toString()] = animate;
} //end angularVelocity//

<<<<<<< HEAD
function toggleVidSize(win, state, func1, func2) {
  let arr,
    styleWidth1 = func1(state.myVideo, win).vidWidth,
    styleWidth2 = func1(state.peerVideo, win).vidWidth;
=======
function resizeMedia(win, state, container, func1, func2, func3) {

  let styleWidth1 = func1(state.myVideo, win).vidWidth,
    styleWidth2 = func1(state.peerVideo, win).vidWidth,
    targetDims = func2(container, win);

  if (styleWidth1 >= styleWidth2) {
    func3(state.myVideo, state.myCanvas, state.myContext, state.peerVideo, state.peerCanvas, state.peerContext, targetDims);
  } else {
    func3(state.peerVideo, state.peerCanvas, state.peerContext, state.myVideo, state.myCanvas, state.myContext, targetDims);
  }
  container.style.height = func1(container, win).vidHeight + 'px';
}

function toggleVidSize(win, state, func1, func2, func3) {
  let arr,
    styleWidth1 = func1(state.myVideo, win).vidWidth,
    styleWidth2 = func1(state.peerVideo, win).vidWidth,
    booths = ['MRGmyCanvas', 'MRGpeerCanvas'];
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51

  if (styleWidth1 >= styleWidth2) {
    let dims = func2(state.myVideo, win);
    setSizes(state.peerVideo, state.peerCanvas, state.peerContext, state.myVideo, state.myCanvas, state.myContext, dims);
    arr = [state.myVideo, state.myCanvas, state.peerVideo, state.peerCanvas];
<<<<<<< HEAD
=======
    booths.forEach( (ele, idx) => {
      func3(ele, 'MRGpointerToggle');
    });

>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  } else {
    let dims = func2(state.peerVideo, win);
    setSizes(state.myVideo, state.myCanvas, state.myContext, state.peerVideo, state.peerCanvas, state.peerContext, dims);
    arr = [state.peerVideo, state.peerCanvas, state.myVideo, state.myCanvas];
<<<<<<< HEAD
=======
    booths.forEach( (ele, idx) => {
      func3(ele, 'MRGpointerToggle');
    });
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  }

  arr.forEach((ele, idx) => {
    if (idx < 2) {
      ele.style.zIndex = '3';
<<<<<<< HEAD
      // ele.classList.add('btmRight');
    } else {
      ele.style.zIndex = '2';
      // ele.classList.remove('btmRight');
=======
    } else {
      ele.style.zIndex = '2';
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
    }
  });

}

function setSizes(upVid, upCanvas, upContext, downVid, downCanvas, downContext, dims) {
  upVid.setAttribute('width', '' + dims.bigVidWidth);
  upVid.setAttribute('height', '' + dims.bigVidHeight);

  upContext = upCanvas.getContext('2d');
  upCanvas.width = dims.bigVidWidth;
  upCanvas.height = dims.bigVidHeight;
<<<<<<< HEAD
  upContext.rect(0, 0, upCanvas.width, upCanvas.height);
  // state.peerContext.scale(1,1);
  upContext.stroke();
=======
  upContext.strokeRect(0, 0, upCanvas.width, upCanvas.height);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51

  downVid.setAttribute('width', '' + dims.smallVidWidth);
  downVid.setAttribute('height', '' + dims.smallVidHeight);

  downContext = downCanvas.getContext('2d');
  downCanvas.width = dims.smallVidWidth;
  downCanvas.height = dims.smallVidHeight;
  downContext.scale(.25, .25);
<<<<<<< HEAD
  downContext.rect(0, 0, downCanvas.width, downCanvas.height);
  downContext.stroke();

}

function resize(win, state, container, func) {

  let dims = func(container, win);
  //resize local elements
  state.myVideo.setAttribute('width', '' + dims.vidWidth);
  state.myVideo.setAttribute('height', '' + dims.vidHeight);

  state.myCanvas.setAttribute('width', '' + dims.vidWidth);
  state.myCanvas.setAttribute('height', '' + dims.vidHeight);

  //resize remote elements
  state.peerVideo.setAttribute('width', '' + dims.vidWidth);
  state.peerVideo.setAttribute('height', '' + dims.vidHeight);

  state.peerCanvas.setAttribute('width', '' + dims.vidWidth);
  state.peerCanvas.setAttribute('height', '' + dims.vidHeight);
=======
  downContext.strokeRect(0, 0, downCanvas.width, downCanvas.height);

>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
}

function generateDims(container, win) {
  let containerStyle = win.getComputedStyle(container);
  let styleWidth = containerStyle.getPropertyValue('width');
  let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let videoHeight = Math.round((videoWidth / 4) * 3);

  return {
    vidWidth: videoWidth,
    vidHeight: videoHeight
  };
}

function vidDims(bigVid, win) {
  let vidStyle = win.getComputedStyle(bigVid);
  let styleWidth = vidStyle.getPropertyValue('width');
  let bigVidWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let bigVidHeight = Math.round((bigVidWidth / 4) * 3);
  let smallVidWidth = bigVidWidth / 4;
  let smallVidHeight = Math.round((smallVidWidth / 4) * 3);

  return {
    bigVidWidth: bigVidWidth,
    bigVidHeight: bigVidHeight,
    smallVidWidth: smallVidWidth,
    smallVidHeight: smallVidHeight
  };
}

function scaleToFill(videoTag, height, width) {
  let video = videoTag,
    videoRatio = 4 / 3,
    tagRatio = width / height;
  if (videoRatio < tagRatio) {
    video.setAttribute('style', '-webkit-transform: scaleX(' + tagRatio / videoRatio + ')');
  } else if (tagRatio < videoRatio) {
    video.setAttribute('style', '-webkit-transform: scaleY(' + videoRatio / tagRatio + ')');
  }
}

function scaleElement(vid, height, width) {
  let video = vid;
  let actualRatio = 4 / 3;
  let targetRatio = width / height;
  let adjustmentRatio = targetRatio / actualRatio;
  let scale = actualRatio < targetRatio ? targetRatio / actualRatio : actualRatio / targetRatio;
  video.setAttribute('style', '-webkit-transform: scale(' + scale + ')');
}

<<<<<<< HEAD
function blinkerOn(boothEleId, btnEleId) {
  if (document.getElementById(boothEleId).classList.contains('MRGhidden')) {
    document.getElementById(btnEleId).classList.add('MRGelementToFadeInAndOut');
  }
}

function blinkerOff(btnId) {
  document.getElementById(btnId).classList.remove('MRGelementToFadeInAndOut');
}

//toggling of vid sizes isn't changing context it seems...

=======
function classToggle(btnEleId, classType) {
  if (document.getElementById(btnEleId).classList.contains(classType)) {
    document.getElementById(btnEleId).classList.remove(classType);
  } else {
    document.getElementById(btnEleId).classList.add(classType);
  }
}

>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
function appendConnectButtons() {
  //creating buttons will replace everytime so eventlistener is good. Will pull out of file
  let connectivityBtns = document.getElementById('MRGconnectivityBtns');
  let conButton = document.createElement('button');
  let disconButton = document.createElement('button');
  conButton.setAttribute('class', 'MRGbtn');
  disconButton.setAttribute('class', 'MRGbtn');
  conButton.setAttribute('id', 'MRGconnect');
  disconButton.setAttribute('id', 'MRGdisconnect');
<<<<<<< HEAD
  conButton.innerHTML = 'Connect';
  disconButton.innerHTML = 'Disconnect';
  conButton.disabled = true;
  disconButton.disabled = true;
=======
  // conButton.innerHTML = 'Connect';
  // disconButton.innerHTML = 'Disconnect';
  conButton.disabled = true;
  disconButton.disabled = true;
  disconButton.classList.add('MRGhidden');
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  connectivityBtns.appendChild(conButton);
  connectivityBtns.appendChild(disconButton);
}

//remove child element of passed in argument from dom
function removeChildren(el) {
  let element = document.getElementById(el);

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

<<<<<<< HEAD
=======
//this should stop the request animation frame recursive calls and also clear the canvas
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
function clearFunc(animeSt, mediaSt) {
  for (let rafID in animeSt.rafObj) {
    cancelAnimationFrame(animeSt.rafObj[rafID]);
  }
<<<<<<< HEAD

  mediaSt.myContext.clearRect(0, 0, 10000,10000);
  mediaSt.peerContext.clearRect(0, 0, 10000,10000);
=======
  mediaSt.myContext.clearRect(0, 0, 10000, 10000);
  mediaSt.peerContext.clearRect(0, 0, 10000, 10000);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
}

function toggleZindex() {
  // toggle Z index of non MRG elements to have Mirage component always show
  // only if can access dom elements
  if (document.querySelectorAll) {
    let domElements = document.body.getElementsByTagName('*');
    for (let i = 0; i < domElements.length; i++) {
<<<<<<< HEAD
      if (domElements[i].id.substring(0,3)!=="MRG") {
        //give fixed elements z index of 1 and non fixed elements z index of -1 to keep positionality
        window.getComputedStyle(domElements[i]).getPropertyValue('position')==='fixed' ? domElements[i].classList.toggle('notMirageFixed') : domElements[i].classList.toggle('notMirage');
=======
      if (domElements[i].id.substring(0, 3) !== 'MRG') {
        //give fixed elements z index of 1 and non fixed elements z index of -1 to keep positionality
        window.getComputedStyle(domElements[i]).getPropertyValue('position') === 'fixed' ? domElements[i].classList.toggle('notMirageFixed') : domElements[i].classList.toggle('notMirage');
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
      }
    }
  }
}

///end of function store///

export {
  toggleVidSize,
  vidDims,
  hiddenToggle,
  disableToggle,
<<<<<<< HEAD
  resize,
  generateDims,
  scaleToFill,
  scaleElement,
  blinkerOn,
  blinkerOff,
=======
  generateDims,
  scaleToFill,
  scaleElement,
  classToggle,
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  paste,
  bounce,
  appendConnectButtons,
  removeChildren,
  clearFunc,
  toggleZindex,
<<<<<<< HEAD
  trackFace,
  hat
=======
  resizeMedia,
  setSizes
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
};
