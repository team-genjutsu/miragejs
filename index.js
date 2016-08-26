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
  paste,
  bounce
} from './components/funcStore';
import {
  mediaGenerator
} from './components/mediaGenerator';
import {
  filterListener,
  animationListener
} from './components/listenerFuncs';

document.addEventListener("DOMContentLoaded", (event) => {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,
    roomID,
    // variables for video, peerCanvas, and context logic
    peerMedia,
    peerVideo,
    peerCanvas,
    peerContext,
    myMedia,
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
    animations = {
      paste: paste,
      bounce: bounce,
      orbit: orbit
    },
    currentAnimation = bounce,
    temp,
    // room buttons
    joinButton = document.getElementById('join-button'),
    randomButton = document.getElementById('random-button'),
    // raf stands for requestAnimationFrame, enables drawing to occur
    raf;

  //image assignment, we can abstract this later
  let emoImg;
  let currentImg = 'assets/emojione/small/1f436.png';
  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia; //end vendor media objects//

  //room selection
  joinButton.addEventListener('click', () => {
      const socket = io.connect('https://463505aa.ngrok.io/') //const socket = io();
      roomID = document.getElementById('room-id-input').value;
      socket.emit('joinRoom', JSON.stringify(roomID));

      socket.on('process', (payload) => {
          payload = JSON.parse(payload);
          if (!payload) {
            alert('Try a different room!')
          } else {
            document.getElementById('roomApp').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            //begin streaming!//
            navigator.getMedia({
                  video: true,
                  audio: false
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

                      myMedia = mediaGenerator(stream, 'myBooth', 'myVideo', 'myCanvas', 533, 400);

                      myVideo = myMedia.video;
                      myCanvas = myMedia.canvas;
                      myContext = myMedia.context;

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

                      peer.on('signal', (data) => {
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

                      document.getElementById('connect').addEventListener('click', () => {
                        socket.emit('second', JSON.stringify(roomID));
                      });

                      socket.on('initialConnected', () => {
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

                      socket.on('thirdPart2', (secondClientSig) => {
                        secondClientSig = JSON.parse(secondClientSig);
                        if (peer.initiator) {
                          peer.signal(secondClientSig);
                        }
                      });

                      socket.on('updateChatters', (chatter) => {
                        chattersClient.splice(chattersClient.indexOf(chatter), 1);
                        document.getElementById('connect').disabled = false;
                      });

                      peer.on('data', (data) => {
                        //conditionally apply or remove filter
                        let dataObj = JSON.parse(data);
                        console.log(dataObj.localEmoji)
                        if (dataObj.message) {
                          document.getElementById('messages').textContent += dataObj.message + '\n';
                        }

                        if (dataObj.local) {
                          if (dataObj.addFilter === 'yes') {
                            setVendorCss(peerVideo, dataObj.filterType);
                          } else if (dataObj.addFilter === 'no') {
                            peerVideo.removeAttribute('style');
                          }
                          //conditionally applies or removes filter
                        } else if (!dataObj.local) {
                          if (dataObj.addFilter === 'yes') {
                            setVendorCss(myVideo, dataObj.filterType);
                          } else if (dataObj.addFilter === 'no') {
                            myVideo.removeAttribute('style');
                          }
                        }

                        if (dataObj.localEmoji) {
                          // console.log(dataObj);
                          //remote display bounce animation!
                          let emoImg = new Image();
                          emoImg.src = dataObj.currentImg;

                          temp = currentAnimation;
                          currentAnimation = eval('(' + dataObj.animation + ')');
                          currentAnimation(peerCanvas, peerContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                          currentAnimation = temp;

                        } else if (!dataObj.localEmoji) {
                          // console.log(dataObj);
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
                      document.getElementById('send').addEventListener('click', () => {
                          //post message in text context on your side
                          //send message object to the data channel
                          let yourMessageObj = JSON.stringify({
                            message: peer.localPort + " " + document.getElementById('yourMessage').value
                          });
                          let yourMessage = peer.localPort + " " + document.getElementById('yourMessage').value;
                          document.getElementById('messages').textContent += yourMessage + '\n';
                          peer.send(yourMessageObj);
                        }) //end send click event//

                      //click event for the "filter me" button//
                      filterListener(myVideo, 'myFilter', current, true, peer);
                      //click event for the "filter them" button
                      filterListener(peerVideo, 'peerFilter', current, false, peer);

                      //tesing filters//
                      button.addEventListener('click', () => {
                        current.innerHTML = filters[i];
                        i++;
                        if (i >= filters.length) i = 0;
                      }, false); //end of filter test//

                      //assigns click event to element, starts local animation, and sends
                      //data for remote animation
                      animationListener(myCanvas, currentImg, currentAnimation, myContext, raf, [velocity, angularVelocity], peer, true, getCursorPosition);

                      Object.keys(animations).forEach((ele, idx) => {
                        document.getElementById(ele).addEventListener('click', (event) => {
                          currentAnimation = animations[ele];
                        })
                      })

                      clearButton.addEventListener('click', (event) => {
                        cancelAnimationFrame(raf);
                        myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
                        peerContext.clearRect(0, 0, peerCanvas.width, peerCanvas.height);
                      });

                      //adding click handler for active emoji selection
                      const emojis = document.getElementsByClassName('emoji');
                      Array.from(emojis, (ele) => {
                        ele.addEventListener('click', (event) => {
                          currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                        })
                      })

                      //peer stream event//
                      peer.on('stream', (stream) => {

                        document.getElementById('connect').disabled = true;
                        document.getElementById('disconnect').disabled = false;


                        peerMedia = mediaGenerator(stream, 'peerBooth', 'peerVideo', 'peerCanvas', 533, 400);

                        peerVideo = peerMedia.video;
                        peerCanvas = peerMedia.canvas;
                        peerContext = peerMedia.context;

                      //assigns click event to element, starts local animation, and sends
                      //data for remote animation
                      animationListener(peerCanvas, currentImg, currentAnimation, peerContext, raf, [velocity, angularVelocity], peer, false, getCursorPosition);
                      
                      }); ///end peer stream event///

                      peer.on('close', () => {

                          socket.emit('disconnect');
                          location.reload();

                        }) //end peer close event//

                      document.getElementById('disconnect').addEventListener('click', (event) => {
                          peer.destroy();
                        }) //end of disconnect click event//

                    }) //end of socket.on('initiated')

                }, //end of stream//
                (err) => {
                  console.error(err);
                }) //end of getMedia//

          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }) //end of 'join' event

});
