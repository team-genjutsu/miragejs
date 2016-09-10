let mirageChunk = `<div id='MRGfixed' class='MRGfixPos'>
    <div id='MRGmaterialBtn'></div>
    <!-- Video demo area -->
    <section id="MRGdemo" class='MRGhidden'>

      <div id="MRGroomApp" class="MRGroom">
        <div id="MRGroom-selection">
          <h1>Choose a room!</h1>
          <div>
            <div id="MRGroom-id-input-div">
              <input type="text" id="MRGroom-id-input" autofocus="">
              <label class="MRGerror-label hidden" for="MRGroom-id-input" id="MRGroom-id-input-label">Room name must be 5 or more characters and include only letters, numbers, underscore and hyphen.</label>
            </div>
            <div id="MRGroom-id-input-buttons">
              <button id="MRGjoin-button" class='MRGroombtn'>JOIN</button>
              <!-- <button id="MRG-random-button" class='MRG-roombtn'>RANDOM</button> -->
            </div>
          </div>
          <div id="MRGrecent-rooms">
            <!-- <p>Recently used rooms:</p> -->
            <!-- <ul id="MRG-recent-rooms-list"></ul> -->
          </div>
        </div>
      </div>
      <!-- End room container-->

      <div id="MRGboothApp" class="MRGhidden">
        <div id='MRGbooth'>
          <div id='MRGvidContainer'>
            <div id='MRGmyBooth'></div>
            <div id='MRGpeerBooth'></div>
          </div>
          <div id="MRGemojiButtons"></div>
        </div>
        <!-- end booth -->

        <div id='MRGoptionBtns'>

          <div id='MRGconnectivityBtns'>
          </div>

          <div id="MRGfilterBtns">
            <button id='MRGfilter' class="MRGbtn">filter: <span id='MRGfilterDisp'></span></button>
            <button id='MRGmyFilter' class="MRGbtn">filter me!</button>
            <button id='MRGpeerFilter' class="MRGbtn">filter them!</button><br/>
            <button id='MRGvideoToggle' class="MRGbtn">Toggle video!</button><br/>
          </div>

          <div id="MRGanimeBtn">
            <button id='MRGclear' class="MRGbtn">clear</button>
            <button id='MRGanimation' class='MRGbtn'>animation: <span id='MRGanimateDisp'>paste</span></button>
          </div>
        </div>
      </div>

    </section>
    <!--close section demo-->
 </div>`;

export {
  mirageChunk
};
