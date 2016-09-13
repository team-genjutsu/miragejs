
function filterListener(vid, whoisFilter, currFilter, whoisBool, channel, func) {
  document.getElementById(whoisFilter).addEventListener('click', () => {
    let filterDataObj;
    // sends boolean data about remote filter application and adds filter on your side
    filterDataObj = JSON.stringify({
      filter: whoisBool,
      filterType: currFilter.innerHTML
    });
    func(vid, currFilter.innerHTML);
    channel.send(filterDataObj);
  }, false);
}

function peerTrackingListener(vid, cv, ctx, img, channel, faceTrack, trackingObj, videoStream) {
  document.getElementById('MRGpeerTracking').addEventListener('click', () => {
    let emoji = img;
    //console.log(trackingObj);
    faceTrack(vid, cv, ctx, trackingObj, videoStream, emoji, channel);
  }, false);
}


function myTrackingListener(vid, cv, ctx, img, channel, trackingObj) {
  document.getElementById('MRGmyTracking').addEventListener('click', () => {
    let trackingDataObj;
    trackingDataObj = JSON.stringify({
      myTrack: vid,
      channel: channel,
      image: img,
      tracking: trackingObj
    });
    channel.send(trackingDataObj);
  }, false);
}


function animationListener(canvas, img, animeObj, animeEle, context, reqAnim, array, channel, local, func, rafObj) {

  canvas.addEventListener('click', (event) => {

    let position = func(canvas, event);

    let emoImage = new Image();
    emoImage.src = img.src;
    //console.log(emoImage.src, "the source in animation listener");

    // let currImg =
    let animation = animeObj[animeEle.innerHTML];
    //animation for local display and data transmission to peer
    animation(canvas, context, event, position, emoImage, reqAnim, array, rafObj);

    let canvasObj = JSON.stringify({
      animation: animeEle.innerHTML,
      localEmoji: local,
      currentImg: emoImage.src,
      position: {
        x: position.x,
        y: position.y
      }
    });

    channel.send(canvasObj);
  }, false);
}

function clearListener(channel, func, clearButton, animeSt, mediaSt) {
  clearButton.addEventListener('click', (event) => {
    func(animeSt, mediaSt);
    channel.send(JSON.stringify({'type' : 'clear'}));
  }, false);

  //send to other client to run clear function
}

export {
  filterListener,
  animationListener,
  clearListener,
  peerTrackingListener,
  myTrackingListener
};
