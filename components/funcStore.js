//function store//

  function bounce(cv, ctx, evt, pos, emoImg, animate, array) {
    let onload = emoImg.onload;
    //this object keeps track of the movement, loads the images, and determines
    //the velocity
    let emoticon = {
      x: pos.x,
      y: pos.y,
      vx: 5,
      vy: 2,
      onload: function() {
        ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
      }
    };
    //initial image load on canvas
    emoticon.onload();
    let callBack = function() {
      array[0](emoticon, ctx, cv, callBack, emoImg, animate);
    }
    //start drawing movement
    animate = window.requestAnimationFrame(callBack);
  }//end bounce//

  function staticPaste(cv, ctx, evt, pos, emoImg) {
    let onload = emoImg.onload;
    //this object keeps track of the movement, loads the images, and determines
    //the velocity
    let emoticon = {
      x: pos.x,
      y: pos.y,
      vx: 5,
      vy: 2,
      onload: function() {
        ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
      }
    };
    //initial image load on canvas
    emoticon.onload();
  }//end staticPaste//

  //orbit func//
  function orbit(cv, ctx, evt, pos, emoImg, animate, array) {
    let onload = emoImg.onload;
    //this object keeps track of the movement, loads the images, and determines
    //the angular veloctiy. We're keeping track of frequency of refreshes to
    //imcrement the degrees
    let movement = .0349066;
    let emoticon = {
      x: pos.x,
      y: pos.y,
      r: 5,
      rotateCount: 1,
      wx: movement,
      wy: movement,
      onload: function() {
        ctx.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
      }
    };
    //initial image load on canvas
    emoticon.onload();
    let callBack = function() {
      array[1](emoticon, ctx, cv, callBack, emoImg, animate);
    }
    //start drawing movement
    animate = window.requestAnimationFrame(callBack);
  }//end orbit//

  //paste object to canvas
  function paste(video, context, width, height, x, y, source) {
    context.drawImage(video, 0, 0, width, height);
    baseImg = new Image();
    baseImg.src = source; // needs to be path ie --> 'assets/weird.png';
    baseImg.onload = function() {
      context.drawImage(baseImg, x - baseImg.width / 2, y - baseImg.height / 2);
      //setTimeout for pasted images//
      // var time = window.setTimeout(function() {
      // context.clearRect(x - baseImg.width / 2, y - baseImg.height / 2, baseImg.width, baseImg.height);
      // }, 5000);
    }
  }//end paste//

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
  }//end getCursorPosition//

  //streamline vendor prefixing for css filtering
  function setVendorCss(element, style) {
    element.style.webkitFilter = style;
    element.style.mozFilter = style;
    element.style.filter = style;
  }//end setVendorCss //

  //draws video on canvas
  function drawVideo(v, c, w, h) {
    if (v.paused || v.ended) return false;
    c.drawImage(v, 0, 0, w, h);
    setTimeout(drawVideo, 20, v, c, w, h);
  }//end drawVideo//

  //canvas draw function for velocity motion
  function velocity(obj, ctx, cv, cb, emoImg, animate) {
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
  }//end velocity//

  //angularVelocity func//
  function angularVelocity(obj, ctx, cv, cb, emoImg, animate) {
    ctx.clearRect(obj.x - emoImg.width / 2 - 5, obj.y - emoImg.height / 2 - 5, emoImg.width + 10, emoImg.height + 10);
    obj.onload();

    obj.x += Math.sin(obj.wx * obj.rotateCount) * obj.r;
    obj.y += Math.cos(obj.wy * obj.rotateCount) * obj.r;
    obj.rotateCount++;

    animate = window.requestAnimationFrame(cb);
  }//end angularVelocity//

  //doesnt work yet, but would provide a way to erase drawn
  //objects in circular fashion rather than rectangular
  function cutCircle(context, x, y, radius) {
    context.globalCompositeOperation = 'destination-out'
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.fill();
  }//end cutCircle//

  ///end of function store///

export { cutCircle, angularVelocity, velocity, drawVideo, setVendorCss, getCursorPosition, orbit, staticPaste, bounce };
