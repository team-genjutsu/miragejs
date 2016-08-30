import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import {
  filterListener,
  animationListener
} from './components/listenerFuncs';
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
    myVideo,
    myContext,
    // variables for filter logic
    currFilter = document.getElementById('filterDisp'),
    filterBtn = document.getElementById('filter'),
    filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'],
    i = 0,
    // clear canvas
    clearButton = document.getElementById('clear'),
    // animation variables
    anime = {
      paste: paste,
      bounce: bounce,
      orbit: orbit
    },
    animeKeys = ['paste', 'bounce', 'orbit'],
    j = 1,
    animeBtn = document.getElementById('animation'),
    currAnime = document.getElementById('animateDisp'),
    currentAnimation,
    temp,
    // room buttons
    joinButton = document.getElementById('join-button'),
    randomButton = document.getElementById('random-button'),
    // raf stands for requestAnimationFrame, enables drawing to occur
    raf,
    emoImg = new Image(),
    currentImg = 'assets/emojione/small/1f436.png',
    emojis = document.getElementsByClassName('emoji');
  //end variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia; //end vendor media objects//

  //room selection
  joinButton.addEventListener('click', () => {
      const socket = io.connect(); //io.connect('https://463505aa.ngrok.io/') 
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

                      myMedia = mediaGenerator(stream, vendorUrl, 'myBooth', 'myVideo', 'myCanvas', 533, 400);

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

                        if (dataObj.hasOwnProperty('local')) {
                          if (dataObj.local) {
                            setVendorCss(peerVideo, dataObj.filterType);
                          } //conditionally applies or removes filter
                          else if (!dataObj.local) {
                            setVendorCss(myVideo, dataObj.filterType);
                          }
                        }

                        if (dataObj.hasOwnProperty('localEmoji')) {
                          if (dataObj.localEmoji) {
                            //remote display bounce animation!
                            let emoImg = new Image();
                            emoImg.src = dataObj.currentImg;

                            temp = currentAnimation;
                            currentAnimation = eval('(' + dataObj.animation + ')');
                            currentAnimation(peerCanvas, peerContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                            currentAnimation = temp;

                          } else if (!dataObj.localEmoji) {
                            //local display bounce animation!
                            let emoImg = new Image();
                            emoImg.src = dataObj.currentImg;

                            temp = currentAnimation;
                            currentAnimation = eval('(' + dataObj.animation + ')');
                            currentAnimation(myCanvas, myContext, event, dataObj.position, emoImg, raf, [velocity, angularVelocity]);
                            currentAnimation = temp;
                          }
                        }
                      });

                      //looks for click event on the send button//
                      document.getElementById('send').addEventListener('click', () => {
                          //post message locally then send to remote 
                          let yourMessageObj = JSON.stringify({
                            message: peer.localPort + " " + document.getElementById('yourMessage').value
                          });
                          let yourMessage = peer.localPort + " " + document.getElementById('yourMessage').value;
                          document.getElementById('messages').textContent += yourMessage + '\n';
                          peer.send(yourMessageObj);
                        }, false) //end send click event//


                      //changing filters//
                      filterBtn.addEventListener('click', () => {
                        currFilter.innerHTML = filters[i];
                        i++;
                        if (i >= filters.length) i = 0;
                      }, false); //end of filter test//

                      //changing animations//
                      animeBtn.addEventListener('click', () => {
                        currAnime.innerHTML = animeKeys[j];
                        currentAnimation = anime[animeKeys[j]];
                        console.log(currentAnimation);
                        j++;
                        if (j >= animeKeys.length) j = 0;
                      }, false)


                      //adding click handler for active emoji selection
                      Array.from(emojis, (ele) => {
                        ele.addEventListener('click', (event) => {
                          currentImg = ele.querySelectorAll('img')[0].getAttribute('src');
                          console.log(currentImg)
                          emoImg.src = currentImg;
                        }, false)
                      })

                      clearButton.addEventListener('click', (event) => {
                        cancelAnimationFrame(raf);
                        myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
                        peerContext.clearRect(0, 0, peerCanvas.width, peerCanvas.height);
                      }, false);


                      //peer stream event//
                      peer.on('stream', (stream) => {

                        document.getElementById('connect').disabled = true;
                        document.getElementById('disconnect').disabled = false;


                        peerMedia = mediaGenerator(stream, vendorUrl, 'peerBooth', 'peerVideo', 'peerCanvas', 533, 400);

                        peerVideo = peerMedia.video;
                        peerCanvas = peerMedia.canvas;
                        peerContext = peerMedia.context;


                        animationListener(myCanvas, emoImg, anime, currAnime, myContext, raf, [velocity, angularVelocity], peer, true, getCursorPosition); //local

                        animationListener(peerCanvas, emoImg, anime, currAnime, peerContext, raf, [velocity, angularVelocity], peer, false, getCursorPosition); //remote

                        //click event for the "filter me" button//
                        filterListener(myVideo, 'myFilter', currFilter, true, peer, setVendorCss);
                        //click event for the "filter them" button
                        filterListener(peerVideo, 'peerFilter', currFilter, false, peer, setVendorCss);
                      }); ///end peer stream event///

                      peer.on('close', () => {

                          socket.emit('disconnect');
                          location.reload();

                        }) //end peer close event//

                      document.getElementById('disconnect').addEventListener('click', (event) => {
                          peer.destroy();
                        }, false) //end of disconnect click event//

                    }) //end of socket.on('initiated')

                }, //end of stream//
                (err) => {
                  console.error(err);
                }) //end of getMedia//

          } //end of boolean in socket 'process' event

        }) //end of socket 'process' event

    }, false) //end of 'join' event

});
