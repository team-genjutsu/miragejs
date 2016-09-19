//function store//

function bounce(cv, ctx, evt, pos, emoImg, animate, array, rafObj) {
  let onload = emoImg.onload;
  //this object keeps track of the movement, loads the images, and determines
  //the velocity
  let dim = 50;
  let emoticon = {
    x: pos.x,
    y: pos.y,
    vx: 5,
    vy: 2,
    onload: function() {
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
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
  let dim = 50;
  let emoticon = {
    x: pos.x,
    y: pos.y,
    vx: 5,
    vy: 2,
    onload: function() {
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
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
  let dim = 50;
  let movement = .0349066;
  let emoticon = {
    x: pos.x,
    y: pos.y,
    r: 5,
    rotateCount: 1,
    wx: movement,
    wy: movement,
    onload: function() {
      ctx.drawImage(emoImg, this.x - dim / 2, this.y - dim / 2, dim, dim);
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

function trackFace(video, canvas, context, trackingObj, videoStream, img, channel) {
  //console.log("data channel", channel);

  // var video = video;
  // var canvas = canvas;
  // var context = context;
  //console.log("tracking object", trackingObj);
  var emoji = new Image();
  if (img.src === undefined) {
    emoji.src = img;
  } else {
    emoji.src = img.src;
  }
  // console.log(emoji);
  var tracker = new trackingObj.ObjectTracker('face');
  tracker.canvasOverlay = canvas;
  var faceRect = {
    x: 100,
    y: 100,
    width: emoji.width * 3,
    height: emoji.height * 3
  };

  //console.log('face track has been called');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracker.canvasOverlay = canvas;
  tracker.canvasContext = context;

  // if(isTrackingBool) {

  trackingObj.track(video, tracker, {
    camera: true
  });
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

//doesnt work yet, but would provide a way to erase drawn
//objects in circular fashion rather than rectangular
function cutCircle(context, x, y, radius) {
  context.globalCompositeOperation = 'destination-out';
  context.arc(x, y, radius, 0, Math.PI * 2, true);
  context.fill();
} //end cutCircle//


//paste object to canvas
// function pasteImg(video, context, width, height, x, y, source) {
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
// } //end paste//


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


function receivedAnimation(localBool, animeState, mediaState, event, dataObj, func1, func2) {
  let emoImg = new Image();
  emoImg.src = dataObj.currentImg;

  animeState.temp = animeState.currentAnimation;
  animeState.currentAnimation = animeState.anime[dataObj.animation];
  if (localBool) {
    animeState.currentAnimation(mediaState.myCanvas, mediaState.myContext, event, dataObj.position, emoImg, animeState.raf, [func1, func2], animeState.rafObj);
  } else {
    animeState.currentAnimation(mediaState.peerCanvas, mediaState.peerContext, event, dataObj.position, emoImg, animeState.raf, [func1, func2], animeState.rafObj);
  }
  animeState.currentAnimation = animeState.temp;

}

export {
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
};
