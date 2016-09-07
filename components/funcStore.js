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

  function paste(cv, ctx, evt, pos, emoImg) {
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
  function pasteImg(video, context, width, height, x, y, source) {
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

  //these functions need to be ported to proper file
    function hiddenToggle(ele1, ele2) {
      let args = [...arguments];
      args.forEach((ele, idx) => {
        let tag = document.getElementById(ele);
        if (ele1 === 'myBooth') {console.log(tag)}
        if(tag.classList.contains('hidden')){
          tag.classList.toggle('hidden');
        }else{
          tag.classList.add('hidden');
        }
      })
    }

    function disableToggle(ele1, ele2) {

      let args = [...arguments];
      args.forEach((ele, idx) => {
        document.getElementById(ele).disabled ? document.getElementById(ele).disabled = false : document.getElementById(ele).disabled = true;
      })
    }

    function resize(win, locVideo, remVideo, locCanvas, remCanvas, locContext, remContext, container, func) {

      let dims = func(container, win);
      //resize local elements
      locVideo.setAttribute('width', '' + dims.vidWidth);
      locVideo.setAttribute('height', '' + dims.vidHeight);

      locCanvas.setAttribute('width', '' + dims.vidWidth);
      locCanvas.setAttribute('height', '' + dims.vidHeight);

      //resize remote elements
      remVideo.setAttribute('width', '' + dims.vidWidth);
      remVideo.setAttribute('height', '' + dims.vidHeight);

      remCanvas.setAttribute('width', '' + dims.vidWidth);
      remCanvas.setAttribute('height', '' + dims.vidHeight);
    }

    function generateDims(container, win) {
      let containerStyle = win.getComputedStyle(container);
      let styleWidth = containerStyle.getPropertyValue('width');
      let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
      let videoHeight = Math.round((videoWidth / 4) * 3);

      return {
        vidWidth: videoWidth,
        vidHeight: videoHeight
      }
    }

    function scaleToFill(videoTag, height, width) {
      let video = videoTag,
        videoRatio = 4 / 3,
        tagRatio = width / height;
      if (videoRatio < tagRatio) {
        video.setAttribute('style', '-webkit-transform: scaleX(' + tagRatio / videoRatio + ')')
      } else if (tagRatio < videoRatio) {
        video.setAttribute('style', '-webkit-transform: scaleY(' + videoRatio / tagRatio + ')')
      }
    }

    function scaleElement(vid, height, width) {
      let video = vid;
      let actualRatio = 4 / 3;
      let targetRatio = width / height;
      let adjustmentRatio = targetRatio / actualRatio;
      let scale = actualRatio < targetRatio ? targetRatio / actualRatio : actualRatio / targetRatio;
      video.setAttribute('style', '-webkit-transform: scale(' + scale + ')');
    };

    function blinkerOn(boothEleId, btnEleId) {
      if (document.getElementById(boothEleId).classList.contains('hidden')) {
        document.getElementById(btnEleId).classList.add('elementToFadeInAndOut');
      }
    }

    function blinkerOff(btnId) {
      document.getElementById(btnId).classList.remove('elementToFadeInAndOut');
    }

    function appendConnectButtons() {
      //creating buttons will replace everytime so eventlistener is good. Will pull out of file
      let connectivityBtns = document.getElementById('connectivityBtns');
      let conButton = document.createElement('button');
      let disconButton = document.createElement('button');
      conButton.setAttribute('class', 'btn btn-info');
      disconButton.setAttribute('class', 'btn btn-info');
      conButton.setAttribute('id', 'connect');
      disconButton.setAttribute('id', 'disconnect');
      conButton.innerHTML = 'Connect';
      disconButton.innerHTML = 'Disconnect';
      conButton.disabled = true;
      disconButton.disabled = true;
      connectivityBtns.appendChild(conButton);
      connectivityBtns.appendChild(disconButton);
    }

  ///end of function store///

export { hiddenToggle, disableToggle, resize, generateDims, scaleToFill, scaleElement, blinkerOn, blinkerOff, cutCircle, angularVelocity, velocity, drawVideo, setVendorCss, getCursorPosition, orbit, paste, bounce, appendConnectButtons };
