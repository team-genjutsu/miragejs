let domReady = function(callback) {
<<<<<<< HEAD
    let ready = false;

    let detach = function() {
        if(document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", completed);
            window.removeEventListener("load", completed);
        } else {
            document.detachEvent("onreadystatechange", completed);
            window.detachEvent("onload", completed);
        }
    }
    let completed = function() {
        if(!ready && (document.addEventListener || event.type === "load" || document.readyState === "complete")) {
            ready = true;
            detach();
            callback();
        }
    };

    if(document.readyState === "complete") {
        callback();
    } else if(document.addEventListener) {
        document.addEventListener("DOMContentLoaded", completed);
        window.addEventListener("load", completed);
    } else {
        document.attachEvent("onreadystatechange", completed);
        window.attachEvent("onload", completed);

        let top = false;

        try {
            top = window.frameElement == null && document.documentElement;
        } catch(e) {}

        if(top && top.doScroll) {
            (function scrollCheck() {
                if(ready) return;

                try {
                    top.doScroll("left");
                } catch(e) {
                    return setTimeout(scrollCheck, 50);
                }

                ready = true;
                detach();
                callback();
            })();
        }
    }
=======
  let ready = false;

  let detach = function() {
    if(document.addEventListener) {
      document.removeEventListener('DOMContentLoaded', completed);
      window.removeEventListener('load', completed);
    } else {
      document.detachEvent('onreadystatechange', completed);
      window.detachEvent('onload', completed);
    }
  };
  let completed = function() {
    if(!ready && (document.addEventListener || event.type === 'load' || document.readyState === 'complete')) {
      ready = true;
      detach();
      callback();
    }
  };

  if(document.readyState === 'complete') {
    callback();
  } else if(document.addEventListener) {
    document.addEventListener('DOMContentLoaded', completed);
    window.addEventListener('load', completed);
  } else {
    document.attachEvent('onreadystatechange', completed);
    window.attachEvent('onload', completed);

    let top = false;

    try {
      top = window.frameElement == null && document.documentElement;
    } catch(e) {console.log(e);}

    if(top && top.doScroll) {
      (function scrollCheck() {
        if(ready) return;

        try {
          top.doScroll('left');
        } catch(e) {
          return setTimeout(scrollCheck, 50);
        }

        ready = true;
        detach();
        callback();
      })();
    }
  }
>>>>>>> 81730e407dd4956e4f4a55fd3982a0c99db59e51
};

export { domReady };
