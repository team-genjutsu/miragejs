function mediaGenerator(stream, localBool, state, mediaHookId, vidAttr, canAttr) {

  let vidContainer = document.getElementById('MRGvidContainer');
  let vidContainerStyle = window.getComputedStyle(vidContainer);

  //size dependent upon width
  let styleWidth = vidContainerStyle.getPropertyValue('width');
  let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let videoHeight = Math.round((videoWidth / 4) * 3);
  vidContainer.style.height = videoHeight +'px';
  let video = document.createElement('video');
  video.setAttribute('id', vidAttr);
  video.setAttribute('width', '' + videoWidth);
  video.setAttribute('height', '' + videoHeight);
  document.getElementById(mediaHookId).appendChild(video);
  video.src = state.roomState.vendorUrl.createObjectURL(stream);

  video.play();

  //draw local overlay canvas//
  let canvas = document.createElement('canvas');
  canvas.setAttribute('id', canAttr);
  document.getElementById(mediaHookId).appendChild(canvas);
  let context = canvas.getContext('2d');

  //width and height should eventually be translated to exact coordination
  //with incoming video stream
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  //draws blank canvas on top of video
  context.strokeRect(0, 0, videoWidth, videoHeight);
  //end//

  if(localBool){
    state.mediaState.myVideo = video;
    state.mediaState.myCanvas = canvas;
    state.mediaState.myContext = context;
  }else{
    state.mediaState.peerVideo = video;
    state.mediaState.peerCanvas = canvas;
    state.mediaState.peerContext = context;
  }

  // return {
    // video: video,
    // canvas: canvas,
    // context: context
  // };
}

export {
  mediaGenerator
};
