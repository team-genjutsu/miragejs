import {
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  paste,
  bounce
} from './funcStore';

function filterListener(vid, whoisFilter, currFilter, whoisBool, peerObj) {
  document.getElementById(whoisFilter).addEventListener('click', () => {
    let filterDataObj;
    // sends boolean data about remote filter application and adds filter on your side
    if (!vid.style.filter) {
      filterDataObj = JSON.stringify({
        local: whoisBool,
        addFilter: 'yes',
        filterType: currFilter.innerHTML
      });
      setVendorCss(vid, currFilter.innerHTML);
    } else {
      //instructions to remove filter and send object to data channel
      filterDataObj = JSON.stringify({
        local: whoisBool,
        addFilter: 'no'
      });
      vid.removeAttribute('style');
    }
    peerObj.send(filterDataObj);
  }, false)
}


function animationListener(canvas, img, animation, context, reqAnim, array, peerObj, local, func) {

  canvas.addEventListener('click', (event) => {
    let position = func(canvas, event);

    let emoImage = new Image();
    emoImage.src = img;

    let canvasObj = JSON.stringify({
      animation: animation.toString(),
      localEmoji: local,
      currentImg: img,
      position: {
        x: position.x,
        y: position.y
      }
    });

    //animation for local display and data transmission to peer
    animation(canvas, context, event, position, emoImage, reqAnim, array);
    peerObj.send(canvasObj);
  }, false)
}

export {
  filterListener,
  animationListener
};
