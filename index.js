document.addEventListener("DOMContentLoaded", function(event) {

  let vendorUrl = window.URL || window.webkitURL,
    peer,
    chattersClient = [],
    chatterThisClient,

    //variables for video, canvas, and context logic
     video,
     canvas,
     context;
     context,

     //variables for filter logic
     current = document.getElementById('filterDisp'),
     button = document.getElementById('filter'),
     filters = ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', ''],
     i = 0;

     //raf stands for requestAnimationFrame, enables drawing to occur
      //raf;

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

    // myVideo.addEventListener('play', function() {
    //   draw(this, context, 400, 300);
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
        if (dataObj.message){
          //post message in the text content chat box spot
          document.getElementById('messages').textContent += dataObj.message + '\n';
          //check data object for key indicating clicked the 'filter me!' button
        } else if (dataObj.myFilter){
          //checks the value of the key to see if a filter needs to be added
            if (dataObj.myFilter === 'yes'){
            //applies filter to video to reflect partner's video
              document.getElementById('video').style.filter = dataObj.filterType;
              //checks value of key to see if filter needs to be removed
            } else if (dataObj.myFilter === 'no'){
              //removes filter
              document.getElementById('video').removeAttribute('style');
            }
          //check data object for key indicating user clicked the "filter them" button
        } else if (dataObj.peerFilter){
          //checks key value to see if a filter needs to be added
          if (dataObj.peerFilter === 'yes'){
            //applies filter
            document.getElementById('my-video').style.filter = dataObj.filterType;
            //checks key value to see if a filter needs to be removed
          } else if (dataObj.peerFilter === 'no'){
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

      //looks for click event on the send button
      document.getElementById('send').addEventListener('click', function() {

        //creates a message object with a stringified object containing the local port and the message
         var yourMessageObj = JSON.stringify({message: peer.localPort + " " + document.getElementById('yourMessage').value});
         //creates a variable with the same information to display on your side
         //peer.localPort is a temporary way to identify peers, should be changed
         var yourMessage = peer.localPort + " " + document.getElementById('yourMessage').value;
        //post message in text context on your side
        document.getElementById('messages').textContent += yourMessage + '\n';
        //send message object to the data channel
        peer.send(yourMessageObj);
      })
      //click event for the "filter me" button
      document.getElementById('myFilter').addEventListener('click', function() {

        //checks for filter and assigns key yes or no based on whether or not one needs to be applied
        if (!document.getElementById('my-video').style.filter){
          //creates and stringify object to send to the data channel with instructions to apply filter
          var filterDataObj = JSON.stringify({myFilter: 'yes', filterType: current.innerHTML});
          //add filter on your side
          document.getElementById('my-video').style.filter = current.innerHTML;
        } else {
          //create and stringify object to send to the data channel with instructions to remove filter
          var filterDataObj = JSON.stringify({myFilter: 'no'});
          document.getElementById('my-video').removeAttribute('style');
        }
        //send object to data channel
        peer.send(filterDataObj);
      })
      //click event for the "filter them" button
      document.getElementById('peerFilter').addEventListener('click', function() {

        //checks for filter and assigns key yes or no based on whether one needs to be applied
        if (!document.getElementById('video').style.filter){
          //creates and stringify object to send to the data channel with instructions to apply filter
          var filterDataObj = JSON.stringify({peerFilter: 'yes', filterType: current.innerHTML});
          //add filter on your side
          document.getElementById('video').style.filter = current.innerHTML;
        } else {
          //creates and stringify object to send to the data channel with instructions to remove filter
          var filterDataObj = JSON.stringify({peerFilter: 'no'});
          //remove filter on your side
          document.getElementById('video').removeAttribute('style');
        }
        //sends object to the data channel
          peer.send(filterDataObj);
      })

      button.addEventListener('click', function() {

          current.innerHTML = filters[i];
          // video.style.webkitFilter = filters[i];
          // video.style.mozFilter = filters[i];
          // video.style.filter = filters[i];

          i++;
          if (i >= filters.length) i = 0;
        }, false);



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

        video.addEventListener('play', function() {
          canvas.width = 640;
          canvas.height = 480;

          make_base(this, context, canvas.width, canvas.height)
          // context.drawImage(this, 0, 0, width, height);
          // draw(this, context, canvas.width, canvas.height);
        }, false);

        video.addEventListener('progress', function() {
          var show = video.currentTime >= 5 && video.currentTime < 10;
          canvas.style.visibility = "visible";
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

    // make_base();
    setTimeout(draw, 10, video, context, width, height);
  }

  function make_base(video, context, width, height) {
    context.drawImage(video, 0, 0, width, height);
    base_image = new Image();
    base_image.src = 'assets/twistedFace.png';
    base_image.onload = function() {
      context.drawImage(base_image, 50, 50);
    }
  }

});
