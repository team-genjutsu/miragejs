import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import {
  cutCircle,
  angularVelocity,
  velocity,
  drawVideo,
  setVendorCss,
  getCursorPosition,
  orbit,
  staticPaste,
  bounce
} from './components/funcStore';

document.addEventListener("DOMContentLoaded", function(event) {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
  peer,
  chattersClient = [],
  chatterThisClient,
  roomID,
  // variables for video, peerCanvas, and context logic
  peerVideo,
  peerCanvas,
  peerContext,
  myCanvas,
  myVideo, //video canvas
  myVidCtx,
  myContext,
  peerVidCtx,
  peerVirtualVid,
  // variables for filter logic
  current = document.getElementById('filterDisp'),
  button = document.getElementById('filter'),
  filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', ''],
  i = 0,
  // clear canvas
  clearButton = document.getElementById('clear'),
  // animation variables
  staticButton = document.getElementById('static'),
  bounceButton = document.getElementById('bounce'),
  orbitButton = document.getElementById('orbit'),
  currentAnimation = bounce,
  temp,
  // room buttons
  joinButton = document.getElementById('join-button'),
  randomButton = document.getElementById('random-button'),
  // raf stands for requestAnimationFrame, enables drawing to occur
  raf;

  //image assignment, we can abstract this later
  // let emoImg = new Image();
  let currentImg = 'assets/emojione/small/1f4a9.png';

  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  //end vendor media objects//

  //room selection
  joinButton.addEventListener('click', function() {
      const socket = io();
      roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomID));
      // socket.on('tryAgain', (payload) => alert('Try a different room!'))

      socket.on('process', (payload) => {
          payload = JSON.parse(payload);
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
                  audio: true
                }, function(stream) {

                  //make initiate event happen automatically when streaming begins
                    socket.emit('initiate', JSON.stringify({
                      streamId: stream.id,
                      roomId: roomID
                    }))

                  socket.on('readyConnect', (payload) => {
                    document.getElementById('connect').disabled = false;
                  })

                  socket.on('initiated', (member) => {
                      member = JSON.parse(member);


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
                      myCanvas.width = 640;
                      myCanvas.height = 480;

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
                        socket.emit('second', JSON.stringify(roomID));
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
                        document.getElementById('connect').disabled = false;
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
                          currentAnimation(peerCanvas, peerContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                          currentAnimation = temp;

                        } else if (dataObj.peerEmoji) {

                          //local display bounce animation!
                          let emoImg = new Image();
                          emoImg.src = dataObj.currentImg;

                          temp = currentAnimation;
                          currentAnimation = eval('(' + dataObj.animation + ')');
                          currentAnimation(myCanvas, myContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
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
                          currentAnimation(myCanvas, myContext, event, myPosition, emoImg, raf, [velocity, angularVelocity]);
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
                      for (let i = 0; i < emojis.length; i++) {
                        emojis[i].addEventListener('click', function(event) {
                          currentImg = emojis[i].querySelectorAll('img')[0].getAttribute('src');
                        })
                      }

                      //peer stream event//
                      peer.on('stream', function(stream) {

                        document.getElementById('connect').disabled = true;
                        document.getElementById('disconnect').disabled = false;
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

                        //remote display animation this to data channel logic easy peasy
                        peerCanvas.addEventListener('click', function(event) {

                            //gets position based mouse click coordinates, restricted
                            //to canvas rectangle, see function logic in function store
                            let peerPosition = getCursorPosition(peerCanvas, event);

                            let emoImg = new Image();
                            emoImg.src = currentImg;

                            currentAnimation(peerCanvas, peerContext, event, peerPosition, emoImg, raf, [velocity, angularVelocity]);

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

                          }, false) //end of click listener logic//

                      }); ///end peer stream event///

                      peer.on('close', function() {

                          socket.emit('disconnect');
                          location.reload();

                        }) //end peer close event//

                      document.getElementById('disconnect').addEventListener('click', function(event) {
                          peer.destroy();
                        }) //end of disconnect click event//

                    }) //end of socket.on('initiated')


                }, //end of stream//
                function(err) {
                  console.error(err);
                }) //end of getMedia//

          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }) //end of 'join' event

});
