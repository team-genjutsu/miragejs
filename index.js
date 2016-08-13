(function() {

    var vendorUrl = window.URL || window.webkitURL;
    let peer;

    navigator.getMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    navigator.getMedia({
        video: true,
        audio: false
    }, function(stream) {
        const socket = io();

        // var initialClient = false;
        console.log(stream);

        socket.emit('initiator?', JSON.stringify(stream.id));
        socket.on('initiated', (chatter) => {

          if (chatter.initiator) {

            peer = new SimplePeer({
              initiator: true,
              trickle: false,
              stream: stream
            })
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
              if (peer.initator) {
                socket.emit('initial', JSON.stringify(data));
              } else if (!peer.initator) {
                socket.emit('third', JSON.stringify(data));
              }
            })

            peer.on('data', function(data) {
              document.getElementById('messages').textContent += data + '\n';
            })

            peer.on('stream', function(stream) {
              var video = document.createElement('video');
              video.setAttribute('id', 'video');
              document.getElementById('booth').appendChild(video);

              var newCanvas = document.createElement('canvas');
              newCanvas.setAttribute('id', 'canvas');
              document.getElementById('booth').appendChild(newCanvas);

              video.src = vendorUrl.createObjectURL(stream);
              video.play();

              var canvas = document.getElementById('canvas'),
              context = canvas.getContext('2d'),
              video = document.getElementById('video');

              video.addEventListener('play', function() {
                draw(this, context, 400, 300);
              }, false);

            });


          });



        document.getElementById('connect').addEventListener('click', function() {
            if (!peer.initator) {
              socket.emit('second');
            }
        })

        socket.on('initalConnected', function(){
          if (!peer.initator){
            console.log('Initiator ready to connect');
          }
        })

        socket.on('secondPart2', (initialClientId) => {
          peer.signal(initialClientId);
        })

        socket.on('thirdPart2', function(secondClientId){
          if (peer.initiator){
            peer.signal(secondClientId);
          }
        })

        document.getElementById('send').addEventListener('click', function() {
            // var yourMessage = document.getElementById('yourMessage').value;
            // peer.send(yourMessage);
            peer.initiator = true
            console.log(peer)
        })


    }, function(err) {
        console.error(err);
    })

    // var canvas = document.getElementById('canvas'),
    // context = canvas.getContext('2d'),
    // video = document.getElementById('video');

    // video.addEventListener('play', function() {
    // draw(this, context, 400, 300);
    // }, false);


    function draw(video, context, width, height) {
        // console.log ('canvas: ' + canvas, 'context: ' + context);
        var image, data, i, r, g, b, brightness;

        context.drawImage(video, 0, 0, width, height);

        image = context.getImageData(0, 0, width, height);
        data = image.data;

        for (i = 0; i < data.length; i = i + 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            brightness = (r + b + g) / 3;

            data[i] = data[i + 1] = data[i + 2] = brightness;
        }

        image.data = data;

        context.putImageData(image, 0, 0);

        setTimeout(draw, 10, video, context, width, height);
    }

})();
