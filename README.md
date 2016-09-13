# mirage-js

</br>
**Mirage-JS**  is a lightweight developer library that gives developers access to a customizable and interactive video chat component.
With a short setup process, a developer can write custom animations and filters or use our robust presets, and can integrate that with a video chat component built on peer to peer webRTC technology. This enables clients access to real time multimedia interactions drawn on 2d canvas overlays.


## Setup

1. Install it from npm
```bash
npm install --save mirage-js
```
2. In client-side Javascript file require mirage-js.
```bash
import { createMirage } from 'mirage-js';
```
3. On the server, navigate to our socket-logic file on node_modules (if server is in root directory, require from './node_modules/server/mirageSocket.js');
```bash
const mirageSocket = require('./node_modules/server/socketLogic.js');
```

## Client side API methods

### Begin component logic, put this code this after all the other methods have been coded
```bash
mirage.startApp();
```

### Gain access to Mirage object
```bash
const mirage = createMirage();
```

### Insert CSS styles for component
```bash
mirage.insertCss();
```

### Insert component onto fixed position on DOM
```bash
mirage.insertChunk();
```

### Add your own filters
```bash
mirage.putFilters = ['blur(5px)', 'saturate(20)'];
```

### Add your own images/emoji
```bash
mirage.putImages = ['https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4a9.png',
     'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/1f4af.png'];
```

## Run your own functions and animations within select events. They take no input, but 'state' is accessible, see below 


### When stream event triggers (both local and remote streams accessible) 
```bash
mirage.on('stream', (state) => {
    // console.log(state);
  });
```

### When onData event triggers (data channel becomes accessible for sending data)
```bash
mirage.on('onData', (state) => {
    // console.log(state);
    state.rtcState.dataChannel.send(JSON.stringify({onData: "yo you're up in the data channels"}));
  });
  ```
  
### When onMessage event triggers (incoming data becomes accessible)
```bash
mirage.on('onMessage', (state) => {
    // console.log(state);
    if(state.hasOwnProperty('dataMsg')){
      console.log(state.dataMsg);
    } 
  });
```


## States

### As of now there are five states, which are properties on a state object that is accessible within the event methods

### Filter State
```bash
state.filterState = {
  filters: ['blur(5px)', 'brightness(0.4)', 'contrast(200%)', 'grayscale(100%)', 'hue-rotate(90deg)', 'invert(100%)', 'sepia(100%)', 'saturate(20)', 'none']; //default filters
  addFilters: (filterArr) => { //add filters, suggested to do through putFilters method
    if (filterArr != undefined || filterArr.length > 0) {
      filterArr.forEach((ele, idx) => {
        if(this.filters.indexOf(ele) < 0){
          this.filters.push(ele);
        }
      });
    }
  };
```

### Room State (access chat client or room information) 
```bash
state.roomState = {
  vendorUrl: //window url
  chattersClient: // you and peer's socket ID
  chatterThisClient: //your socket ID
  roomID: //shared room object on server
}
```

### Media State
```bash
state.mediaState = {
  peerBooth: //DOM element container for remote canvas and video
  peerVideo: //remote video
  peerCanvas: //remote canvas overlay
  peerContext: //remote context of canvas
  myBooth: //DOM element container for local canvas and video
  myVideo: //local video
  myCanvas: //local canvas overlay
  myContext: //local canvas context
}
```

### Anime State (animation data)
```bash
state.animeState = {
  anime: //object of default functions, paste, bounce, orbit
  animeBtn: //DOM button with event listener to choose animation
  currAnime: //DOM display element for current animation
  currentAnimation: current chosen animation function
  raf: //request animation frame variable
  rafObj: //object collection of rafs
  currentImg: //current selected image
  emojis: //array collection of images
  emoBtns: //DOM buttons for image selections
}
```

### RTC State
```bash
state.rtc = {
  localStream: //local video stream
  remoteStream: //remote video stream
  dataChannel: //data channel shared between clients
}
```

## Our Team
* Kevin Liu - [github.com/kevoutthebox](https://github.com/kevoutthebox)
* Morgan Christison - [github.com/MorganChristison](https://github.com/MorganChristison)
* Blake Watkins - [github.com/blkwtkns](https://github.com/blkwtkns)

## License
ISC
