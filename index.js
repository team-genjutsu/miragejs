document.addEventListener("DOMContentLoaded", function(event) {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,
    roomID,
    //variables for video, peerCanvas, and context logic
    peerVideo,
    peerCanvas,
    peerContext,
    myCanvas,
    myVideo, //video canvas
    myVidCtx,
    myContext,
    peerVidCtx,
    peerVirtualVid,
    //variables for filter logic
    current = document.getElementById('filterDisp'),
    button = document.getElementById('filter'),
    filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', ''],
    i = 0,
    //clear canvas
    clearButton = document.getElementById('clear'),
    //animation variables
    staticButton = document.getElementById('static'),
    bounceButton = document.getElementById('bounce'),
    orbitButton = document.getElementById('orbit'),
    currentAnimation = bounce,
    temp,
    //room buttons
    joinButton = document.getElementById('join-button'),
    randomButton = document.getElementById('random-button'),
    //raf stands for requestAnimationFrame, enables drawing to occur
    raf;

  //image assignment, we can abstract this later
  // let emoImg = new Image();
  let currentImg = 'assets/smLoveTongue.png';

  const socket = io();
  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  //end vendor media objects//

  //room selection
  joinButton.addEventListener('click', function() {
      roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomID));
      // socket.on('tryAgain', (payload) => alert('Try a different room!'))

      socket.on('process', (payload) => {
          console.log('in process', payload)
          payload = JSON.parse(payload);
          console.log(payload)
          if (!payload) {
            alert('Try a different room!')
          } else {

            document.getElementById('roomApp').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            // }
            // })
            //begin streaming!//
            navigator.getMedia({
                video: true,
                audio: false
              }, function(stream) {


                //make initiate event happen automatically when streaming begins
                (function() {
                  socket.emit('initiate', JSON.stringify({
                    streamId: stream.id,
                    roomId: roomID
                  }))
                })();


                socket.on('readyConnect', (payload) => {
                  document.getElementById('connect').disabled = false; 
                })

                socket.on('initiated', (member) => {
                    member = JSON.parse(member);

                    // document.getElementById('roomApp').classList.add('hidden');
                    // document.getElementById('mainApp').classList.remove('hidden');

                    //uses the stream from the local webcam and draws it on canvas//
                    let myVirtualVid = document.createElement('video');
                    myVirtualVid.src = window.URL.createObjectURL(stream);
                    myVirtualVid.play();

                    //draw local vid on canvas//
                    myVideo = document.getElementById('myVideo')
                    myVidCtx = myVideo.getContext('2d');

                    myVirtualVid.addEventListener('play', function() {
                      drawVideo(this, myVidCtx, myVideo.width, myVideo.height);
                    }, false);
                    //end//

                    //draw local overlay canvas//
                    myCanvas = document.getElementById('myCanvas')
                    myContext = myCanvas.getContext('2d');

                    //width and height should eventually be translated to exact coordination
                    //with incoming video stream
                    myCanvas.width = 500; //640;
                    myCanvas.height = 385; //480;

                    //draws blank canvas on top of video
                    myContext.rect(0, 0, myCanvas.width, myCanvas.height);
                    myContext.stroke();
                    //end//

                    //set room ID shared between clients
                    roomID = member.roomId;

                    if (chattersClient.filter(clientChatter => clientChatter.id !== member.id).length || !chattersClient.length) {
                      chattersClient.push(member);
                      chatterThisClient = member.id;
                    }

                    //instantiate peer object
                    peer = new SimplePeer({
                      initiator: member.initiator,
                      trickle: false,
                      stream: stream
                    })

                    peer.on('signal', function(data) {
                      document.getElementById('yourId').value = "Connected!";
                      let signalObj = JSON.stringify({
                        roomId: roomID,
                        signal: data
                      });

                      if (peer.initiator) {
                        socket.emit('initial', signalObj);
                      } else if (!peer.initiator) {
                        socket.emit('third', signalObj);
                      }
                    })

                    document.getElementById('connect').addEventListener('click', function() {
                      // if (!peer.initiator) {
                        socket.emit('second', JSON.stringify(roomID));
                      // }
                    });

                    socket.on('initialConnected', function() {
                      if (!peer.initiator) {
                        console.log('Initial connected good');
                      }
                    });

                    socket.on('secondPart2', (initialClientSig) => {
                      initialClientSig = JSON.parse(initialClientSig)
                      if (!peer.initiator) {
                        peer.signal(initialClientSig);
                      }
                    });

                    socket.on('thirdPart2', function(secondClientSig) {
                      secondClientSig = JSON.parse(secondClientSig);
                      if (peer.initiator) {
                        peer.signal(secondClientSig);
                      }
                    });

                    socket.on('updateChatters', (chatter) => {
                      chattersClient.splice(chattersClient.indexOf(chatter), 1);
                    });


                    peer.on('data', function(data) {

                      //parse data string to get the data object
                      let dataObj = JSON.parse(data);
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

                        //remote display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        temp = currentAnimation;
                        currentAnimation = eval('(' + dataObj.animation + ')');
                        currentAnimation(peerCanvas, peerContext, event, dataObj.position, emoImg);
                        currentAnimation = temp;

                      } else if (dataObj.peerEmoji) {

                        //local display bounce animation!
                        let emoImg = new Image();
                        emoImg.src = dataObj.currentImg;

                        temp = currentAnimation;
                        currentAnimation = eval('(' + dataObj.animation + ')');
                        currentAnimation(myCanvas, myContext, event, dataObj.position, emoImg);
                        currentAnimation = temp;
                      }

                    });



                    //looks for click event on the send button//
                    document.getElementById('send').addEventListener('click', function() {

                        //creates a message object with a stringified object containing the local port and the message
                        let yourMessageObj = JSON.stringify({
                          message: peer.localPort + " " + document.getElementById('yourMessage').value
                        });
                        //creates a variable with the same information to display on your side
                        //peer.localPort is a temporary way to identify peers, should be changed
                        let yourMessage = peer.localPort + " " + document.getElementById('yourMessage').value;
                        //post message in text context on your side
                        document.getElementById('messages').textContent += yourMessage + '\n';
                        //send message object to the data channel
                        peer.send(yourMessageObj);
                      })
                      //end send click event//

                    //click event for the "filter me" button//
                    document.getElementById('myFilter').addEventListener('click', function() {

                      let filterDataObj;
                      //checks for filter and assigns key yes or no based on whether or not one needs to be applied
                      if (!myVideo.style.filter) {
                        //creates and stringify object to send to the data channel with instructions to apply filter
                        filterDataObj = JSON.stringify({
                          myFilter: 'yes',
                          filterType: current.innerHTML
                        });
                        //add filter on your side
                        setVendorCss(myVideo, current.innerHTML);
                      } else {
                        //create and stringify object to send to the data channel with instructions to remove filter
                        filterDataObj = JSON.stringify({
                          myFilter: 'no'
                        });
                        myVideo.removeAttribute('style');
                      }
                      //send object to data channel
                      peer.send(filterDataObj);
                    })

                    //click event for the "filter them" button
                    document.getElementById('peerFilter').addEventListener('click', function() {

                      let filterDataObj;
                        //checks for filter and assigns key yes or no based on whether one needs to be applied
                        if (!peerVideo.style.filter) {
                          //creates and stringify object to send to the data channel with instructions to apply filter
                          filterDataObj = JSON.stringify({
                            peerFilter: 'yes',
                            filterType: current.innerHTML
                          });
                          //add filter on your side
                          setVendorCss(peerVideo, current.innerHTML);
                        } else {
                          //creates and stringify object to send to the data channel with instructions to remove filter
                          filterDataObj = JSON.stringify({
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
                        let myPosition = getCursorPosition(myCanvas, event);

                        let emoImg = new Image();
                        emoImg.src = currentImg;

                        let myCanvasObj = JSON.stringify({
                          animation: currentAnimation.toString(),
                          emoji: 'yes',
                          currentImg: currentImg,
                          position: {
                            x: myPosition.x,
                            y: myPosition.y
                          }
                        });

                        //animation for local display and data transmission to peer
                        currentAnimation(myCanvas, myContext, event, myPosition, emoImg);
                        peer.send(myCanvasObj);

                      }, false)
                      //end of click listener logic//

                    // adding buttons to change active animations
                    staticButton.addEventListener('click', function(event) {
                      currentAnimation = staticPaste;
                    });

                    bounceButton.addEventListener('click', function(event) {
                      currentAnimation = bounce;
                    });

                    orbitButton.addEventListener('click', function(event) {
                      currentAnimation = orbit;
                    });

                    clearButton.addEventListener('click', function(event) {
                      cancelAnimationFrame(raf);
                      myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
                      peerContext.clearRect(0, 0, peerCanvas.width, peerCanvas.height);

                    });

                    //adding click handler for active emoji selection
                    const emojis = document.getElementsByClassName('emoji');
                    for (let i = 0; i < emojis.length; i++){
                      emojis[i].addEventListener('click', function(event) {
                        currentImg = emojis[i].querySelectorAll('img')[0].getAttribute('src');
                    })}

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
                        peerVideo.width = 500; //640;
                        peerVideo.height = 385; //460;
                        drawVideo(this, peerVidCtx, peerVideo.width, peerVideo.height);
                      }, false);
                      //end remote draw//

                      peerCanvas = document.getElementById('peerCanvas')
                      peerContext = peerCanvas.getContext('2d');

                      //width and height should eventually be translated to exact coordination
                      //with incoming video stream
                      peerCanvas.width = 500; //640;
                      peerCanvas.height = 385; //460;

                      //draws blank canvas on top of video, visibility may be unnecessary
                      peerContext.rect(0, 0, peerCanvas.width, peerCanvas.height);
                      peerContext.stroke();

                      //remote display animation this to data channel logic easy peasy
                      peerCanvas.addEventListener('click', function(event) {

                          //gets position based mouse click coordinates, restricted
                          //to canvas rectangle, see function logic in function store
                          let peerPosition = getCursorPosition(peerCanvas, event);

                          let emoImg = new Image();
                          emoImg.src = currentImg;

                          currentAnimation(peerCanvas, peerContext, event, peerPosition, emoImg);

                          let peerCanvasObj = JSON.stringify({
                            animation: currentAnimation.toString(),
                            peerEmoji: 'yes',
                            currentImg: currentImg,
                            position: {
                              x: peerPosition.x,
                              y: peerPosition.y
                            }
                          });
                          peer.send(peerCanvasObj);

                        }, false)
                        //end of click listener logic//

                    });
                    ///end peer stream event///
                  }) //end of socket.on('initiated')


              },
              function(err) {
                console.error(err);
              })
          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }) //end of 'join' event


  //function store//

  function bounce(cv, ctx, evt, pos, emoImg) {
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
      velocity(emoticon, ctx, cv, callBack, emoImg);
    }

    //start drawing movement
    raf = window.requestAnimationFrame(callBack);
  }

  function staticPaste(cv, ctx, evt, pos, emoImg) {
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
  }

  //orbit func//
  function orbit(cv, ctx, evt, pos, emoImg) {
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
      angularVelocity(emoticon, ctx, cv, callBack, emoImg);
    }

    //start drawing movement
    raf = window.requestAnimationFrame(callBack);
  }
  //end orbit//

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
  //end paste//

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
  }
  //end getCursorPosition//

  //streamline vendor prefixing for css filtering
  function setVendorCss(element, style) {
    element.style.webkitFilter = style;
    element.style.mozFilter = style;
    element.style.filter = style;
  }
  //end setVendorCss //

  //draws video on canvas
  function drawVideo(v, c, w, h) {
    if (v.paused || v.ended) return false;
    c.drawImage(v, 0, 0, w, h);
    setTimeout(drawVideo, 20, v, c, w, h);
  }
  //end drawVideo//

  //canvas draw function for velocity motion
  function velocity(obj, ctx, cv, cb, emoImg) {
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
    raf = window.requestAnimationFrame(cb);
  }
  //end velocity//

  //angularVelocity func//
  function angularVelocity(obj, ctx, cv, cb, emoImg) {
    ctx.clearRect(obj.x - emoImg.width / 2 - 5, obj.y - emoImg.height / 2 - 5, emoImg.width + 10, emoImg.height + 10);
    obj.onload();

    obj.x += Math.sin(obj.wx * obj.rotateCount) * obj.r;
    obj.y += Math.cos(obj.wy * obj.rotateCount) * obj.r;
    obj.rotateCount++;

    raf = window.requestAnimationFrame(cb);
  }
  //end angularVelocity//

  //doesnt work yet, but would provide a way to erase drawn
  //objects in circular fashion rather than rectangular
  function cutCircle(context, x, y, radius) {
    context.globalCompositeOperation = 'destination-out'
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.fill();
  }
  //end cutCircle//

  ///end of function store///

});
