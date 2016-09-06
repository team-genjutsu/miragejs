let mirageChunk = `<div id='fixed' class='fixPos'>
    <div id='materialBtn'>
      </div>
    <!-- Video demo area -->
    <section id="demo" class='hidden'>

      <div id="roomApp" class="room container">
        <div id="room-selection" class="">
          <h1>Choose a room!</h1>
          <div>
            <div id="room-id-input-div">
              <input type="text" id="room-id-input" autofocus="">
              <label class="error-label hidden" for="room-id-input" id="room-id-input-label">Room name must be 5 or more characters and include only letters, numbers, underscore and hyphen.</label>
            </div>
            <div id="room-id-input-buttons">
              <button id="join-button" class='roombtn'>JOIN</button>
              <!-- <button id="random-button" class='roombtn'>RANDOM</button> -->
            </div>
          </div>
          <div id="recent-rooms">
            <!-- <p>Recently used rooms:</p> -->
            <!-- <ul id="recent-rooms-list"></ul> -->
          </div>
        </div>
      </div>
      <!-- End room container-->

      <div id="boothApp" class="hidden">
        <div id='booth'>
          <div id='vidContainer'>
            <div id='myBooth'></div>
            <div id='peerBooth'></div>
          </div>
          <div id="emojiButtons" class="btn-group"></div>
        </div>
        <!-- end booth -->

        <div id='optionBtns'>

          <div id='connectivityBtns' class='btn-group'>
            <button id='connect' class="btn btn-info">Connect</button>
            <button id='disconnect' class="btn btn-info">Disconnect</button>
          </div>

          <div id="filterBtns" class="btn-group">
            <button id='filter' class="btn btn-primary">filter: <span id='filterDisp'></span></button>
            <button id='myFilter' class="btn btn-info">filter me!</button>
            <button id='peerFilter' class="btn btn-info">filter them!</button><br/>
            <button id='videoToggle' class="btn btn-info">Toggle video!</button><br/>
          </div>

          <div id="animeBtn" class="btn-group">
            <button id='clear' class="btn btn-primary">clear</button>
            <button id='animation' class='btn btn-success'>animation: <span id='animateDisp'>paste</span></button>
          </div>
        </div>
      </div>

    </section>
    <!--close section demo-->
 </div>`;

export { mirageChunk };
