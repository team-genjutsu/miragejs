let cssChunk = `<style>
.MRGbtmRight {
  bottom: 0;
  right: 0;
}

#MRGfixed {
  position: fixed;
  width: 61px;
  height: 61px;
  bottom: 10px;
  right: 20px;
}

#MRGmaterialBtn {
  z-index: 2147483647;
  position: fixed;
  overflow: visible;
  bottom: 10px;
  right: 20px;
  /* background-color: #F44336; */
  background: url('./assets/playimg.png');
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background: #03a9f4;
  border: none;
  outline: none;
  color: #FFF;
  font-size: 36px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  /* transition: .3s; */
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.MRGemoji {
  display: inline;
  height: 50%;
  width: 50%;
  border-radius: 5px;
}

.MRGelementToFadeInAndOut {
  -webkit-animation: fadeinout 1s linear forwards infinite;
  animation: fadeinout 1s linear forwards infinite;
  opacity: 0;
}

#MRGemojiButtons {
  /* height: 22%; */
  width: 13%;
  margin-left: 7%;

}

#MRGoptionBtns {
  display: inline-flex;
  margin-right: 15%;
  /* width: 100%; */
  /* margin-left: -22%; */
}

#MRGanimeBtn {
  position: relative;
  display: inherit;
}

#MRGfilterBtns {
  display: inline-flex;
  position: relative;
  vertical-align: middle;
}

.logo {
  font-size: 75px;
}

.MRGhidden {
  display: none;
}

.MRGfixPos {
  position: fixed;
}

#MRGdemo {
  z-index: 2147483646;
  position: absolute;
  /* display: block; */
  overflow: hidden;
  bottom: 0;
  right: 0;
  text-align: center;
  height: 700px;
  width: 900px;
  /* padding-top: 75%; */
  border: 1px solid;
  margin-bottom: 80%;
  margin-right: 80%;
  border-radius: 10px;
  background-color: white;
}

#MRGboothApp {
  padding-top: 5%;
  text-align: center;
  height: inherit;
  width: inherit;
}

#MRGbooth {
  height: 80%;
  width: 100%;
  position: relative;
  display: inline-flex;
}

#MRGselectImg {
  margin: 5px 20px 5px 5px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

#MRGvidContainer {
  height: 100%;
  /*45em;*/
  width: 75%;
  /*60em;*/
}

#MRGmyBooth {
  margin-left: 5%;
  position: absolute;
}

#MRGpeerBooth {
  position: absolute;
  margin-left: 5%;
}

#MRGmyVideo {
  text-align: center;
  position: absolute;
  z-index: 2;
  visibility: visible;
}

#MRGpeerVideo {
  text-align: center;
  position: absolute;
  z-index: 2;
  visibility: visible;
}

#MRGmyCanvas {
  text-align: center;
  z-index: 2147483000;
  position: absolute;
  visibility: visible;
}

#MRGpeerCanvas {
  text-align: center;
  z-index: 2147483000;
  position: absolute;
  visibility: visible;
}

#MRGconnectivity-buttons {
  /* width: 100%; */
  /* margin: 15px; */
}

.MRGconnectButton {
  display: inline;
}

.MRGbtn {
  background-color: #4285F4;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 0.8em;
  /* margin: 0 5px 20px 5px; */
  width: 7em;
  height: 4em;
  /* padding: 0.5em 0.7em 0.5em 0.7em; */
  -webkit-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
}

.MRGbtn:active {
  background-color: #3367D6;
}

.MRGbtn:hover {
  background-color: #3B78E7;
}

.MRGbtn:focus {
  outline: none;
  -webkit-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
}

.MRGemojibtn {
  background-color: #42c9f4;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 0.8em;
  /* margin: 0 5px 20px 5px; */
  width: 4em;
  height: 4em;
  /* padding: 0.5em 0.7em 0.5em 0.7em; */
  -webkit-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
}

.MRGemojibtn:active {
  background-color: #3367D6;
}

.MRGemojibtn:hover {
  background-color: #3B78E7;
}

.MRGemojibtn:focus {
  outline: none;
  -webkit-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
}
/*////// room selection start ///////////////////*/

#MRGroomApp {
  height: 100%;
  width: 100%;
  background-color: white;
}

#MRGrecent-rooms-list {
  list-style-type: none;
  padding: 0 15px;
}

.MRGroombtn {
  background-color: #4285F4;
  border: none;
  border-radius: 2px;
  color: white;
  font-size: 0.8em;
  margin: 0 5px 20px 5px;
  width: 8em;
  height: 2.75em;
  padding: 0.5em 0.7em 0.5em 0.7em;
  -webkit-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, .5);
}

.MRGroombtn:active {
  background-color: #3367D6;
}

.MRGroombtn:hover {
  background-color: #3B78E7;
}

.MRGroombtn:focus {
  outline: none;
  -webkit-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  -moz-box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
  box-shadow: 0 10px 15px 0 rgba(0, 0, 0, .5);
}

.MRGroombtn[disabled] {
  color: rgb(76, 76, 76);
  color: rgba(255, 255, 255, 0.3);
  background-color: rgb(30, 30, 30);
  background-color: rgba(255, 255, 255, 0.12);
}

#MRGroom-selection input[type=text] {
  border: none;
  border-bottom: solid 1px #4c4c4f;
  font-size: 1em;
  background-color: transparent;
  color: #ccc;
  padding: .4em 0;
  margin-right: 20px;
  width: 100%;
  display: block;
}

#MRGroom-selection input[type="text"]:focus {
  border-bottom: solid 2px #4285F4;
  outline: none;
}

#MRGroom-selection input[type="text"].invalid {
  border-bottom: solid 2px #F44336;
}

#MRGroom-selection label.error-label {
  color: #F44336;
  font-size: .85em;
  font-weight: 200;
  margin: 0;
}

#MRGroom-id-input-div {
  margin: 15px;
}

#MRGroom-id-input-buttons {
  margin: 15px;
}

#MRGroom-selection h1 {
  font-weight: 300;
  margin: 0 0 0.8em 0;
  padding: 0 0 0.2em 0;
}

div#MRGroom-selection {
  margin: 3em auto 0 auto;
  width: 25em;
  padding: 7em 1.5em 1.3em 1.5em;
}

#MRGroom-selection p {
  color: #eee;
  font-weight: 300;
  line-height: 1.6em;
}


/*////// room selection end /////////////////////*/

@media screen only and (max-width: 600px) {
  #myBooth,
  #peerBooth {
    width: 100%;
  }
}

.app {
  margin: 15px;
}

@keyframes fade {
  0%,
  100% {
    opacity: 0
  }
  50% {
    opacity: 1
  }
}

@-webkit-keyframes fadeinout {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.blckQt {
  z-index: -1;
}

.aboutUs {
  z-index: -1;
}

.notMirage {
  z-index: -1;
}

.notMirageFixed {
  z-index: 1;
}

</style>`;

export { cssChunk };
