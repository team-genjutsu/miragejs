function mediaGenerator(stream, url, mediaHookId, vidAttr, canAttr) {

  let vidContainer = document.getElementById('MRGvidContainer');
  let vidContainerStyle = window.getComputedStyle(vidContainer);
<<<<<<< HEAD
  let styleWidth = vidContainerStyle.getPropertyValue('width');
  let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let videoHeight = Math.round((videoWidth / 4) * 3);
  //console.log(videoWidth, videoHeight);
=======

  //size dependent upon width
  let styleWidth = vidContainerStyle.getPropertyValue('width');
  let videoWidth = Math.round(+styleWidth.substring(0, styleWidth.length - 2));
  let videoHeight = Math.round((videoWidth / 4) * 3);
  vidContainer.style.height = videoHeight +'px';
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51

  let video = document.createElement('video');
  video.setAttribute('id', vidAttr);
  video.setAttribute('width', '' + videoWidth);
  video.setAttribute('height', '' + videoHeight);
  document.getElementById(mediaHookId).appendChild(video);
  video.src = url.createObjectURL(stream);
<<<<<<< HEAD
  // video.src = window.URL.createObjectURL(stream);
=======
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
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
<<<<<<< HEAD
  context.rect(0, 0, videoWidth, videoHeight);
  context.stroke();
=======
  context.strokeRect(0, 0, videoWidth, videoHeight);
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
  //end//

  return {
    video: video,
    canvas: canvas,
    context: context
  };
}

export {
  mediaGenerator
};
