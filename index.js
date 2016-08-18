document.addEventListener("DOMContentLoaded", function(event) {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,
    video,
    canvas,
    context,
    button = document.getElementById('filter'),
    current = document.getElementById('filterDisp'),
    filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none'],
    i = 0,
    raf;

  let emoImg = new Image();
  emoImg.src = 'assets/smLoveTongue.png';

  //variable store//

  //vendor media objects//
  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  //vendor media objects//


  navigator.getMedia({
    video: true,
    audio: false
  }, function(stream) {
    const socket = io();

    //creates a video element
    var myVideo = document.createElement('video');
    myVideo.setAttribute('id', 'my-video');
    document.getElementById('booth').appendChild(myVideo);

    //uses the stream from the local webcam before it gets reassigned
    myVideo.src = window.URL.createObjectURL(stream);
    myVideo.play();

    // myVideo.addEventListener('play', function() {
    // draw(this, context, 400, 300);
    // }, false);

    socket.emit('initiator?', JSON.stringify(stream.id));
    socket.on('initiated', (chatter) => {
      if (chattersClient.filter(clientChatter => clientChatter.id !== chatter.id).length || !chattersClient.length) {
        chattersClient.push(chatter);
        chatterThisClient = chatter.id;
      }
      if (chatter.initiator) {
        // console.log('i am initiated 1')
        peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: stream
        });
      } else {
        // console.log('i am initiator 2')
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
        document.getElementById('messages').textContent += data + '\n';
        console.log('yo')
      });

      document.getElementById('connect').addEventListener('click', function() {
        if (!peer.initiator) {
          socket.emit('second');
        }
      });

      socket.on('initialConnected', function() {
        // console.log('initialConnected', peer.initiator)
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
        // console.log(peer.initiator)
        if (peer.initiator) {
          peer.signal(secondClientId);
        }
      });

      socket.on('updateChatters', (chatter) => {
        console.log(chattersClient)
        chattersClient.splice(chattersClient.indexOf(chatter), 1);
        console.log(chattersClient)
      });

      document.getElementById('send').addEventListener('click', function() {
        // var yourMessage = document.getElementById('yourMessage').value;
        // peer.send(yourMessage);
        // peer.initiator = true
        // console.log(peer)
        peer.send('yo');
      })



      peer.on('stream', function(stream) {
        video = document.createElement('video');
        video.setAttribute('id', 'video');
        document.getElementById('innerbooth').appendChild(video);

        video.src = vendorUrl.createObjectURL(stream);
        video.play();

        canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        document.getElementById('innerbooth').appendChild(canvas);

        context = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;
        context.rect(0, 0, canvas.width, canvas.height);
        context.stroke();
        canvas.style.visibility = "visible";




        //leave just in case
        video.addEventListener('play', function() {

          // make_base(this, context, canvas.width, canvas.height)
          // draw(this, context, canvas.width, canvas.height);
        }, false);

        //enables overlay, may be unnecessary//
        video.addEventListener('progress', function() {}, false);
        //enables overlay//

        //tesing MDN example//


        //test to manipulate canvas insertion and coordinate extraction
        canvas.addEventListener('click', function(event) {
            // console.log(getCursorPosition(canvas, event), 'event: ', event);
            // tesing for getting objects to move
            let emoticon = {
              x: getCursorPosition(canvas, event).x,
              y: getCursorPosition(canvas, event).y,
              vx: 5,
              vy: 2,
              draw: function() {
                var self = this;
                emoImg.onload = function() {
                  // console.log('img hi')
                  context.drawImage(baseImg, self.x - emoImg.width / 2, self.y - emoImg.height / 2);
                }
              }
            };

            raf = window.requestAnimationFrame(draw);

            if (emoticon.y + emoticon.vy > canvas.height || emoticon.y + emoticon.vy < 0) {
              emoticon.vy = -emoticon.vy;
            }
            if (emoticon.x + emoticon.vx > canvas.width || emoticon.x + emoticon.vx < 0) {
              emoticon.vx = -emoticon.vx;
            }
            // emoticon.draw()

            function draw() {
              console.log(emoticon)
              context.clearRect(0, 0, canvas.width, canvas.height);
              emoticon.draw();
              emoticon.x += emoticon.vx;
              emoticon.y += emoticon.vy;
              raf = window.requestAnimationFrame(draw);
            }

            //tesing for putting img on canvas
            // var position = getCursorPosition(canvas, event);
            // paste(this, context, canvas.width, canvas.height, position.x, position.y)
          }, false)
          //////////////

        //tesing filters//
        button.addEventListener('click', function() {
          console.log('filter please: ' + filters[i]);
          current.innerHTML = filters[i];
          video.style.webkitFilter = filters[i];
          video.style.mozFilter = filters[i];
          video.style.filter = filters[i];

          i++;
          if (i >= filters.length) i = 0;
        }, false);

      });
    })


  }, function(err) {
    console.error(err);
  })



  function paste(video, context, width, height, x, y) {
    context.drawImage(video, 0, 0, width, height);
    baseImg = new Image();
    baseImg.src = 'assets/weird.png';
    baseImg.onload = function() {
      console.log(baseImg.width, baseImg.height);
      context.drawImage(baseImg, x - baseImg.width / 2, y - baseImg.height / 2);
      // var time = window.setTimeout(function() {
      // context.clearRect(x - baseImg.width / 2, y - baseImg.height / 2, baseImg.width, baseImg.height);
      // }, 5000);
    }
  }

  function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var pos = {
      x: x,
      y: y
    };
    return pos;
    // console.log("x: " + x + " y: " + y, pos);
  }

});
