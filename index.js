document.addEventListener("DOMContentLoaded", function(event) {

  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,
    video,
    canvas,
    context;

  navigator.getMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

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

    myVideo.addEventListener('play', function() {
      draw(this, context, 400, 300);
    }, false);

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
      })

      peer.on('stream', function(stream) {
        video = document.createElement('video');
        video.setAttribute('id', 'video');
        document.getElementById('booth').appendChild(video);

        video.src = vendorUrl.createObjectURL(stream);
        video.play();

        canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        document.getElementById('booth').appendChild(canvas);

        context = canvas.getContext('2d');

        video.addEventListener('play', function() {
          canvas.width = 640;
          canvas.height = 480;

          draw(this, context, canvas.width, canvas.height);
        }, false);
      });
    })


  }, function(err) {
    console.error(err);
  })



  function draw(video, context, width, height) {
    var image, data, i, r, g, b, brightness;

    context.drawImage(video, 0, 0, width, height);

    image = context.getImageData(0, 0, width, height);
    data = image.data;

    for (i = 0; i < data.length; i = i + 4) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      brightness = (r + b + g);

      data[i] = data[i + 1] = data[i + 2] = brightness;
    }

    image.data = data;

    context.putImageData(image, 0, 0);

    make_base();
    setTimeout(draw, 10, video, context, width, height);
  }

  function make_base() {
    base_image = new Image();
    base_image.src = 'assets/twistedFace.png';
    base_image.onload = function() {
      context.drawImage(base_image, 50, 50);
    }
  }

});
