function mediaGenerator(stream, mediaHookId, vidAttr, canAttr, width, height) {

  let video = document.createElement('video');
  video.setAttribute('id', vidAttr);
  document.getElementById(mediaHookId).appendChild(video)
  video.src = window.URL.createObjectURL(stream);
  video.play();

  //draw local overlay canvas//
  let canvas = document.createElement('canvas');
  canvas.setAttribute('id', canAttr);
  document.getElementById(mediaHookId).appendChild(canvas)
  let context = canvas.getContext('2d');

  //width and height should eventually be translated to exact coordination
  //with incoming video stream
  canvas.width = width;
  canvas.height = height;

  //draws blank canvas on top of video
  context.rect(0, 0, canvas.width, canvas.height);
  context.stroke();
  //end//
  return {
    video: video,
    canvas: canvas,
    context: context
  }
}

export {
  mediaGenerator
}
