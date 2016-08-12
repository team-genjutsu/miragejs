(function() {

    var vendorUrl = window.URL || window.webkitURL;

    navigator.getMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    navigator.getMedia({
        video: true,
        audio: false
    }, function(stream) {

        console.log(stream);
        var peer = new SimplePeer({
            initiator: location.hash === '#init',
            trickle: false,
            stream: stream
        })

        peer.on('signal', function(data) {
            document.getElementById('yourId').value = JSON.stringify(data);
        })

        document.getElementById('connect').addEventListener('click', function() {
            var otherId = JSON.parse(document.getElementById('otherId').value);
            peer.signal(otherId);
        })


        document.getElementById('send').addEventListener('click', function() {
            var yourMessage = document.getElementById('yourMessage').value;
            peer.send(yourMessage);
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
        // console.log('canvas: ' + canvas, 'context: ' + context);
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
