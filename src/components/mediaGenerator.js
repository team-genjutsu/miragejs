function mediaGenerator(stream, localBool, state) {

  //please god, don't judge me for this monstrosity!
  let boothId, vidId, canId;
  if(localBool){
    boothId = state.elementState.localBoothId;
    vidId = state.elementState.localVidId;
    canId = state.elementState.localCanvasId;
  }else{
    boothId = state.elementState.remoteBoothId;
    vidId = state.elementState.remoteVidId;
    canId = state.elementState.remoteCanvasId;
  }

  let vidContainer = document.getElementById('MRGvidContainer');
  let vidContainerStyle = window.getComputedStyle(vidContainer);

  //size dependent upon width
  let styleWidth = vidContainerStyle.getPropertyValue('width');
  let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let videoHeight = Math.round((videoWidth / 4) * 3);
  vidContainer.style.height = videoHeight +'px';
  let video = document.createElement('video');
  video.setAttribute('id', vidId);
  video.setAttribute('width', '' + videoWidth);
  video.setAttribute('height', '' + videoHeight);
  document.getElementById(boothId).appendChild(video);
  video.src = state.roomState.vendorUrl.createObjectURL(stream);

  video.play();

  //draw local overlay canvas//
  let canvas = document.createElement('canvas');
  canvas.setAttribute('id', canId);
  document.getElementById(boothId).appendChild(canvas);
  let context = canvas.getContext('2d');

  //width and height should eventually be translated to exact coordination
  //with incoming video stream
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  //draws blank canvas on top of video
  context.strokeRect(0, 0, videoWidth, videoHeight);
  //end//

  //crucial styling//
  document.getElementById(boothId).style.position = 'absolute';
  video.style.position = 'absolute';
  canvas.style.position = 'absolute';
  canvas.style.zIndex = '2147483000';

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
