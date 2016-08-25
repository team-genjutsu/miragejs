function vidGenerator() {

  // let myVirtualVid = document.createElement('video');
  // myVirtualVid.src = window.URL.createObjectURL(stream);
  // myVirtualVid.play();

  //draw local vid on canvas//
  // let myVideo = document.getElementById('myVideo')
  // let myVidCtx = myVideo.getContext('2d');

  // myVirtualVid.addEventListener('play', function() {
    // drawVideo(this, myVidCtx, myVideo.width, myVideo.height);
  // }, false);
  //end//

 let myVideo = document.createElement('video');
  myVideo.setAttribute('id', 'myVideo');
  myVideo.src = window.URL.createObjectURL(stream);
  myVideo.play();

  //draw local overlay canvas//
  myCanvas = document.getElementById('myCanvas')
  myContext = myCanvas.getContext('2d');

  //width and height should eventually be translated to exact coordination
  //with incoming video stream
  myCanvas.width = 640;
  myCanvas.height = 460;

  //draws blank canvas on top of video
  myContext.rect(0, 0, myCanvas.width, myCanvas.height);
  myContext.stroke();
  //end//

  <div id='myBooth'>
            <video id="myVideo"></video>
            <canvas id="myCanvas"></canvas>
          </div>
}

export { vidGenerator }
