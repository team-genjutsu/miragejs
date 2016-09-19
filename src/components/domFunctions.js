function hiddenToggle(ele1, ele2) {
  let args = [...arguments];
  args.forEach((ele, idx) => {
    let tag = document.getElementById(ele);
    if (tag.classList.contains('MRGhidden')) {
      tag.classList.remove('MRGhidden');
    } else {
      tag.classList.add('MRGhidden');
    }
  });
}

//element manipulation
function disableToggle(ele1, ele2) {
  let args = [...arguments];
  args.forEach((ele, idx) => {
    document.getElementById(ele).disabled ? document.getElementById(ele).disabled = false : document.getElementById(ele).disabled = true;
  });
}

//element manipulation
function setVendorCss(element, style) {
  element.style.webkitFilter = style;
  element.style.mozFilter = style;
  element.style.filter = style;
}

//video and canvas dimensional manipulation
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

//video and canvas dimensional manipulation
function toggleVidSize(win, state, func1, func2, func3, func4) {
  let arr,
    styleWidth1 = func1(state.myVideo, win).vidWidth,
    styleWidth2 = func1(state.peerVideo, win).vidWidth,
    booths = ['MRGmyCanvas', 'MRGpeerCanvas'];
  if (styleWidth1 >= styleWidth2) {
    let dims = func2(state.myVideo, win);
    func4(state.peerVideo, state.peerCanvas, state.peerContext, state.myVideo, state.myCanvas, state.myContext, dims);
    arr = [state.myVideo, state.myCanvas, state.peerVideo, state.peerCanvas];
    booths.forEach((ele, idx) => {
      func3(ele, 'MRGpointerToggle');
    });

  } else {
    let dims = func2(state.peerVideo, win);
    func4(state.myVideo, state.myCanvas, state.myContext, state.peerVideo, state.peerCanvas, state.peerContext, dims);
    arr = [state.peerVideo, state.peerCanvas, state.myVideo, state.myCanvas];

    booths.forEach((ele, idx) => {
      func3(ele, 'MRGpointerToggle');
    });
  }

  arr.forEach((ele, idx) => {
    if (idx < 2) {
      ele.style.zIndex = '3';
    } else {
      ele.style.zIndex = '2';
    }
  });

}

//video and canvas dimensional manipulation
function setSizes(upVid, upCanvas, upContext, downVid, downCanvas, downContext, dims) {
  upVid.setAttribute('width', '' + dims.bigVidWidth);
  upVid.setAttribute('height', '' + dims.bigVidHeight);

  upContext = upCanvas.getContext('2d');
  upCanvas.width = dims.bigVidWidth;
  upCanvas.height = dims.bigVidHeight;
  upContext.strokeRect(0, 0, upCanvas.width, upCanvas.height);

  downVid.setAttribute('width', '' + dims.smallVidWidth);
  downVid.setAttribute('height', '' + dims.smallVidHeight);

  downContext = downCanvas.getContext('2d');
  downCanvas.width = dims.smallVidWidth;
  downCanvas.height = dims.smallVidHeight;
  downContext.scale(.25, .25);
  downContext.strokeRect(0, 0, downCanvas.width, downCanvas.height);
}

//video and canvas dimensional manipulation
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

//video and canvas dimensional manipulation
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

//not used
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

//not used 
function scaleElement(vid, height, width) {
  let video = vid;
  let actualRatio = 4 / 3;
  let targetRatio = width / height;
  let adjustmentRatio = targetRatio / actualRatio;
  let scale = actualRatio < targetRatio ? targetRatio / actualRatio : actualRatio / targetRatio;
  video.setAttribute('style', '-webkit-transform: scale(' + scale + ')');
}

//element manipulator
function classToggle(btnEleId, classType) {
  if (document.getElementById(btnEleId).classList.contains(classType)) {
    document.getElementById(btnEleId).classList.remove(classType);
  } else {
    document.getElementById(btnEleId).classList.add(classType);
  }
}

//element manipulator
function appendConnectButtons() {
  //creating buttons will replace everytime so eventlistener is good. Will pull out of file
  let connectivityBtns = document.getElementById('MRGconnectivityBtns');
  let conButton = document.createElement('button');
  let disconButton = document.createElement('button');
  conButton.setAttribute('class', 'MRGbtn');
  disconButton.setAttribute('class', 'MRGbtn');
  conButton.setAttribute('id', 'MRGconnect');
  disconButton.setAttribute('id', 'MRGdisconnect');
  // conButton.innerHTML = 'Connect';
  // disconButton.innerHTML = 'Disconnect';
  conButton.disabled = true;
  disconButton.disabled = true;
  disconButton.classList.add('MRGhidden');
  connectivityBtns.appendChild(conButton);
  connectivityBtns.appendChild(disconButton);
}

//remove child element of passed in argument from dom
//element manipulator
function removeChildren(el) {
  let element = document.getElementById(el);

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}


//this should stop the request animation frame recursive calls and also clear the canvas
//element manipulator
function clearFunc(animeSt, mediaSt) {
  for (let rafID in animeSt.rafObj) {
    cancelAnimationFrame(animeSt.rafObj[rafID]);
  }

  mediaSt.myContext.clearRect(0, 0, 10000, 10000);
  mediaSt.peerContext.clearRect(0, 0, 10000, 10000);
}

//make a new function store of element manipulators
function toggleZindex() {
  // toggle Z index of non MRG elements to have Mirage component always show
  // only if can access dom elements
  if (document.querySelectorAll) {
    let domElements = document.body.getElementsByTagName('*');
    for (let i = 0; i < domElements.length; i++) {

      if (domElements[i].id.substring(0, 3) !== 'MRG') {
        //give fixed elements z index of 1 and non fixed elements z index of -1 to keep positionality
        window.getComputedStyle(domElements[i]).getPropertyValue('position') === 'fixed' ? domElements[i].classList.toggle('notMirageFixed') : domElements[i].classList.toggle('notMirage');
      }
    }
  }
}

export {
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
};
