document.addEventListener("DOMContentLoaded", function(event) {

  //variable store//
  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,

    //variables for video, canvas, and context logic
    video,
    canvas,
    context,

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

        //parse data string to get the data object
        var dataObj = JSON.parse(data);
        //check data object for keys indicating if the type of data is a message
        if (dataObj.message) {
          //post message in the text content chat box spot
          document.getElementById('messages').textContent += dataObj.message + '\n';
          //check data object for key indicating clicked the 'filter me!' button
        } else if (dataObj.myFilter) {
          //checks the value of the key to see if a filter needs to be added
          console.log("hi I'm data for filter shit", dataObj.myFilter)
          if (dataObj.myFilter === 'yes') {
            //applies filter to video to reflect partner's video
            document.getElementById('video').style.filter = 'saturate(8)';
            //checks value of key to see if filter needs to be removed
          } else if (dataObj.myFilter === 'no') {
            //removes filter
            document.getElementById('video').removeAttribute('style');
          }
          //check data object for key indicating user clicked the "filter them" button
        } else if (dataObj.peerFilter) {
          console.log("hi I'm data for filter shit", dataObj.peerFilter)
            //checks key value to see if a filter needs to be added
          if (dataObj.peerFilter === 'yes') {
            //applies filter
            document.getElementById('my-video').style.filter = 'saturate(8)';
            //checks key value to see if a filter needs to be removed
          } else if (dataObj.peerFilter === 'no') {
            //removes filter
            document.getElementById('my-video').removeAttribute('style');
          }
        }

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
          if (!document.getElementById('my-video').style.filter) {
            //creates and stringify object to send to the data channel with instructions to apply filter
            var filterDataObj = JSON.stringify({
              myFilter: 'yes'
            });
            //add filter on your side
            document.getElementById('my-video').style.filter = 'saturate(8)';
          } else {
            //create and stringify object to send to the data channel with instructions to remove filter
            var filterDataObj = JSON.stringify({
              myFilter: 'no'
            });
            document.getElementById('my-video').removeAttribute('style');
          }
          //send object to data channel
          peer.send(filterDataObj);
        })
        ///end filter me click event///

      //click event for the "filter them" button//
      document.getElementById('peerFilter').addEventListener('click', function() {

          //checks for filter and assigns key yes or no based on whether one needs to be applied
          if (!document.getElementById('video').style.filter) {
            //creates and stringify object to send to the data channel with instructions to apply filter
            var filterDataObj = JSON.stringify({
              peerFilter: 'yes'
            });
            //add filter on your side
            document.getElementById('video').style.filter = 'saturate(8)';
          } else {
            //creates and stringify object to send to the data channel with instructions to remove filter
            var filterDataObj = JSON.stringify({
              peerFilter: 'no'
            });
            //remove filter on your side
            document.getElementById('video').removeAttribute('style');
          }
          //sends object to the data channel
          peer.send(filterDataObj);
        })
        ///end filter them click event///

      //tesing filters//
      button.addEventListener('click', function() {

        current.innerHTML = filters[i];
        video.style.webkitFilter = filters[i];
        video.style.mozFilter = filters[i];
        video.style.filter = filters[i];

        i++;
        if (i >= filters.length) i = 0;
      }, false);
      //end of filter test//

      //peer stream event//
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

        //width and height should eventually be translated to exact coordination
        //with incoming video stream
        canvas.width = 640;
        canvas.height = 480;

        //draws blank canvas on top of video, visibility may be unnecessary
        context.rect(0, 0, canvas.width, canvas.height);
        context.stroke();
        canvas.style.visibility = "visible";

        //leave just in case event is needed
        video.addEventListener('play', function() {}, false);

        video.addEventListener('progress', function() {}, false);
        /////////////////////////

        //click listener for image insertion w/ movement, we can translate 
        //this to data channel logic easy peasy
        canvas.addEventListener('click', function(event) {

            //gets position based mouse click coordinates, restricted
            //to canvas rectangle, see function logic in function store
            var position = getCursorPosition(canvas, event);
            var onload = emoImg.onload;

            //this object keeps track of the movement, loads the images, and determines 
            //the velocity
            let emoticon = {
              x: position.x,
              y: position.y,
              vx: 5,
              vy: 2,
              onload: function() {
                context.drawImage(emoImg, this.x - emoImg.width / 2, this.y - emoImg.height / 2);
              }
            };

            //initial image load on canvas
            emoticon.onload();

            //start drawing movement
            raf = window.requestAnimationFrame(draw);

            //draw function that clears canvas, then redraws newly positioned object
            function draw() {
              context.clearRect(0, 0, canvas.width, canvas.height);
              emoticon.onload();
              emoticon.x += emoticon.vx;
              emoticon.y += emoticon.vy;
              if (emoticon.y + emoticon.vy > canvas.height || emoticon.y + emoticon.vy < 0) {
                emoticon.vy = -emoticon.vy;
              }
              if (emoticon.x + emoticon.vx > canvas.width || emoticon.x + emoticon.vx < 0) {
                emoticon.vx = -emoticon.vx;
              }
              raf = window.requestAnimationFrame(draw);
            }
            //end of draw function//

            //leave for tesing for putting random img on canvas
            // paste(this, context, canvas.width, canvas.height, position.x, position.y)
          }, false)
          //end of click listener logic//


      });
      ///end peer stream event///
    })


  }, function(err) {
    console.error(err);
  })


  //function store//
  function paste(video, context, width, height, x, y) {
    context.drawImage(video, 0, 0, width, height);
    baseImg = new Image();
    baseImg.src = 'assets/weird.png';
    baseImg.onload = function() {
      console.log(baseImg.width, baseImg.height);
      context.drawImage(baseImg, x - baseImg.width / 2, y - baseImg.height / 2);
      //setTimeout for pasted images//
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
  }
  ///end of function store///
});
