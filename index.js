document.addEventListener("DOMContentLoaded", function(event) {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,

    //variables for video, peerCanvas, and context logic
    peerVideo,
    peerCanvas,
    peerContext,
    myCanvas,
    myVideo, //canvas
    myVidCtx,
    peerVidCtx,
    peerVirtualVid,

    //variables for filter logic
    current = document.getElementById('filterDisp'),
    button = document.getElementById('filter'),
    filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', ''],
    i = 0,

    //raf stands for requestAnimationFrame, enables drawing to occur
    raf;

  //image assignment, we can abstract this later
  let emoImg = new Image();
  emoImg.src = 'assets/smLoveTongue.png';

  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  //end vendor media objects//


  navigator.getMedia({
    video: true,
    audio: false
  }, function(stream) {
    const socket = io();

    //creates a video element
    //try not to display video, but use feed from it to map onto canvas

    //uses the stream from the local webcam and draws it on canvas//
    var myVirtualVid = document.createElement('video');
    myVirtualVid.src = window.URL.createObjectURL(stream);
    myVirtualVid.play();

    myVideo = document.getElementById('myVideo')
    myVidCtx = myVideo.getContext('2d');

    myVirtualVid.addEventListener('play', function() {
      drawVideo(this, myVidCtx, myVideo.width, myVideo.height);
    }, false);
    //end of video to canvas process//


    myCanvas = document.getElementById('myCanvas')


    myContext = myCanvas.getContext('2d');

    //width and height should eventually be translated to exact coordination
    //with incoming video stream
    myCanvas.width = 640;
    myCanvas.height = 480;

    //draws blank canvas on top of video, visibility may be unnecessary
    myContext.rect(0, 0, myCanvas.width, myCanvas.height);
    myContext.stroke();

    //available listeners if needed
    // video.addEventListener('play', function() {}, false);
    // video.addEventListener('progress', function() {}, false);

    //click listener for image insertion w/ movement, we can translate
    //this to data channel logic easy peasy


    socket.emit('initiator?', JSON.stringify(stream.id));
    socket.on('initiated', (chatter) => {
      if (chattersClient.filter(clientChatter => clientChatter.id !== chatter.id).length || !chattersClient.length) {
        chattersClient.push(chatter);
        chatterThisClient = chatter.id;
      }
      if (chatter.initiator) {
        peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: stream
        });
      } else {
        peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: stream
        })
      }


      peer.on('signal', function(data) {
        document.getElementById('yourId').value = JSON.stringify(data);
        // if (window.location.href.match(/#init/)){
        //   initialClient = true;
        // }
        if (peer.initiator) {
          socket.emit('initial', JSON.stringify(data));
        } else if (!peer.initiator) {
          socket.emit('third', JSON.stringify(data));
        }
      })

      peer.on('data', function(data) {

        //parse data string to get the data object
        var dataObj = JSON.parse(data);
        //check data object for keys indicating if the type of data is a message
        if (dataObj.message) {
          //post message in the text content chat box spot
          document.getElementById('messages').textContent += dataObj.message + '\n';
          //check data object for key indicating clicked the 'filter me!' button
        } else if (dataObj.myFilter) {
          //checks the value of the key to see if a filter needs to be added
          if (dataObj.myFilter === 'yes') {
            //applies filter to video to reflect partner's video
            setVendorCss(peerVideo, dataObj.filterType);
            //checks value of key to see if filter needs to be removed
          } else if (dataObj.myFilter === 'no') {
            //removes filter
            peerVideo.removeAttribute('style');
          }

          //check data object for key indicating user clicked the "filter them" button
        } else if (dataObj.peerFilter) {
          //checks key value to see if a filter needs to be added
          if (dataObj.peerFilter === 'yes') {
            //applies filter
            setVendorCss(myVideo, dataObj.filterType);
            //checks key value to see if a filter needs to be removed
          } else if (dataObj.peerFilter === 'no') {
            //removes filter
            myVideo.removeAttribute('style');
          }
        } else if (dataObj.emoji) {

              var onload = emoImg.onload;

              //this object keeps track of the movement, loads the images, and determines
              //the velocity
              let emoticon = {
                x: dataObj.positionX,
                y: dataObj.positionY,
                vx: 5,
                vy: 2,
                onload: function() {
                  peerContext.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
                }
              };

              //initial image load on canvas
              emoticon.onload();

              var callBack = function() {
                draw(emoticon, peerContext, peerCanvas, callBack);
              }

              //start drawing movement
              raf = window.requestAnimationFrame(callBack);

              //leave for tesing for putting random img on canvas
              // paste(this, context, peerCanvas.width, peerCanvas.height, position.x, position.y)
            }
            else if (dataObj.peerEmoji) {

                  var onload = emoImg.onload;

                  //this object keeps track of the movement, loads the images, and determines
                  //the velocity
                  let emoticon = {
                    x: dataObj.positionX,
                    y: dataObj.positionY,
                    vx: 5,
                    vy: 2,
                    onload: function() {
                      myContext.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
                    }
                  };

                  //initial image load on canvas
                  emoticon.onload();

                  var callBack = function() {
                    draw(emoticon, myContext, myCanvas, callBack);
                  }

                  //start drawing movement
                  raf = window.requestAnimationFrame(callBack);

                  //leave for tesing for putting random img on canvas
                  // paste(this, context, peerCanvas.width, peerCanvas.height, position.x, position.y)
                }



      });

      document.getElementById('connect').addEventListener('click', function() {
        if (!peer.initiator) {
          socket.emit('second');
        }
      });

      socket.on('initialConnected', function() {
        if (!peer.initiator) {
          console.log('Initial connected good');
        }
      });

      socket.on('secondPart2', (initialClientId) => {
        if (!peer.initiator) {
          peer.signal(initialClientId);
        }
      });

      socket.on('thirdPart2', function(secondClientId) {
        if (peer.initiator) {
          peer.signal(secondClientId);
        }
      });

      socket.on('updateChatters', (chatter) => {
        chattersClient.splice(chattersClient.indexOf(chatter), 1);
      });

      //looks for click event on the send button//
      document.getElementById('send').addEventListener('click', function() {

          //creates a message object with a stringified object containing the local port and the message
          var yourMessageObj = JSON.stringify({
            message: peer.localPort + " " + document.getElementById('yourMessage').value
          });
          //creates a variable with the same information to display on your side
          //peer.localPort is a temporary way to identify peers, should be changed
          var yourMessage = peer.localPort + " " + document.getElementById('yourMessage').value;
          //post message in text context on your side
          document.getElementById('messages').textContent += yourMessage + '\n';
          //send message object to the data channel
          peer.send(yourMessageObj);
        })
        //end send click event//

      //click event for the "filter me" button//
      document.getElementById('myFilter').addEventListener('click', function() {

        //checks for filter and assigns key yes or no based on whether or not one needs to be applied
        if (!myVideo.style.filter) {
          //creates and stringify object to send to the data channel with instructions to apply filter
          var filterDataObj = JSON.stringify({
            myFilter: 'yes',
            filterType: current.innerHTML
          });
          //add filter on your side
          setVendorCss(myVideo, current.innerHTML);
        } else {
          //create and stringify object to send to the data channel with instructions to remove filter
          var filterDataObj = JSON.stringify({
            myFilter: 'no'
          });
          myVideo.removeAttribute('style');
        }
        //send object to data channel
        peer.send(filterDataObj);
      })

      //click event for the "filter them" button
      document.getElementById('peerFilter').addEventListener('click', function() {

          //checks for filter and assigns key yes or no based on whether one needs to be applied
          if (!peerVideo.style.filter) {
            //creates and stringify object to send to the data channel with instructions to apply filter
            var filterDataObj = JSON.stringify({
              peerFilter: 'yes',
              filterType: current.innerHTML
            });
            //add filter on your side
            setVendorCss(peerVideo, current.innerHTML);
          } else {
            //creates and stringify object to send to the data channel with instructions to remove filter
            var filterDataObj = JSON.stringify({
              peerFilter: 'no'
            });
            //remove filter on your side
            peerVideo.removeAttribute('style');
          }
          //sends object to the data channel
          peer.send(filterDataObj);
        })
        ///end filter them click event///

      //tesing filters//
      button.addEventListener('click', function() {

        current.innerHTML = filters[i];

        i++;
        if (i >= filters.length) i = 0;
      }, false);

      //end of filter test//
      myCanvas.addEventListener('click', function(event) {

          //gets position based mouse click coordinates, restricted
          //to canvas rectangle, see function logic in function store
          var position = getCursorPosition(myCanvas, event);
          var onload = emoImg.onload;
          var myCanvasObj = JSON.stringify({emoji: 'yes', positionX: position.x, positionY: position.y});
          console.log(position);

          //this object keeps track of the movement, loads the images, and determines
          //the velocity
          let emoticon = {
            x: position.x,
            y: position.y,
            vx: 5,
            vy: 2,
            onload: function() {
              myContext.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
            }
          };

          //initial image load on canvas
          emoticon.onload();

          var callBack = function() {
            draw(emoticon, myContext, myCanvas, callBack);
          }

          //start drawing movement
          raf = window.requestAnimationFrame(callBack);

          peer.send(myCanvasObj);

          //leave for tesing for putting random img on canvas
          // paste(this, context, peerCanvas.width, peerCanvas.height, position.x, position.y)
        }, false)
        //end of click listener logic//

      //peer stream event//
      peer.on('stream', function(stream) {

        // peerVideo = document.getElementById('peerVideo')
        // peerVideo.src = vendorUrl.createObjectURL(stream);
        // peerVideo.play();

        //uses the stream from the remote webcam and draws it on canvas//
        peerVirtualVid = document.createElement('video');
        peerVirtualVid.src = vendorUrl.createObjectURL(stream);
        peerVirtualVid.play();

        peerVideo = document.getElementById('peerVideo')
        peerVidCtx = peerVideo.getContext('2d');

        peerVirtualVid.addEventListener('play', function() {
          peerVideo.width = 640;
          peerVideo.height = 460;
          drawVideo(this, peerVidCtx, peerVideo.width, peerVideo.height);
        }, false);
        //end remote draw//

        peerCanvas = document.getElementById('peerCanvas')
        peerContext = peerCanvas.getContext('2d');

        //width and height should eventually be translated to exact coordination
        //with incoming video stream
        peerCanvas.width = 640;
        peerCanvas.height = 460;

        //draws blank canvas on top of video, visibility may be unnecessary
        peerContext.rect(0, 0, peerCanvas.width, peerCanvas.height);
        peerContext.stroke();

        //available listeners if needed
        // video.addEventListener('play', function() {}, false);
        // video.addEventListener('progress', function() {}, false);

        //click listener for image insertion w/ movement, we can translate
        //this to data channel logic easy peasy
        peerCanvas.addEventListener('click', function(event) {

            //gets position based mouse click coordinates, restricted
            //to canvas rectangle, see function logic in function store
            var position = getCursorPosition(peerCanvas, event);
            var onload = emoImg.onload;
            var emoji = JSON.stringify({peerEmoji: 'yes', positionX: position.x, positionY: position.y});

            //this object keeps track of the movement, loads the images, and determines
            //the velocity
            let emoticon = {
              x: position.x,
              y: position.y,
              vx: 5,
              vy: 2,
              onload: function() {
                peerContext.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
              }
            };

            //initial image load on canvas
            emoticon.onload();

            var callBack = function() {
              draw(emoticon, peerContext, peerCanvas, callBack);
            }

            //start drawing movement
            raf = window.requestAnimationFrame(callBack);
            peer.send(emoji);

            //leave for tesing for putting random img on canvas
            // paste(this, context, peerCanvas.width, peerCanvas.height, position.x, position.y)
          }, false)
          //end of click listener logic//



      });
      ///end peer stream event///
    })


  }, function(err) {
    console.error(err);
  })


  //function store//

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
  }

  //gets cursor position upon mouse click that places
  //an object or starts object movement
  function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var pos = {
      x: x,
      y: y
    };
    return pos;
  }

  //streamline vendor prefixing for css filtering
  function setVendorCss(element, style) {
    element.style.webkitFilter = style;
    element.style.mozFilter = style;
    element.style.filter = style;
  }

  //draws video on canvas
  function drawVideo(v, c, w, h) {
    if (v.paused || v.ended) return false;
    c.drawImage(v, 0, 0, w, h);
    setTimeout(drawVideo, 20, v, c, w, h);
  }

  //canvas draw function for velocity motion
  function draw(obj, ctx, cv, cb) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    obj.onload();
    obj.x += obj.vx;
    obj.y += obj.vy;
    if (obj.y + obj.vy > cv.height || obj.y + obj.vy < 0) {
      obj.vy = -obj.vy;
    }
    if (obj.x + obj.vx > cv.width || obj.x + obj.vx < 0) {
      obj.vx = -obj.vx;
    }
    raf = window.requestAnimationFrame(cb);
  }
  ///end of function store///

});
