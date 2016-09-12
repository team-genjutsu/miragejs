import * as funcStore from '../../src/components/funcStore';
import { expect } from 'chai';
// import fs from 'fs';
import sinon from 'sinon';


describe("functions should exist", () => {
  it('paste should exist', () => {
    expect(typeof funcStore.paste).to.equal('function');
  });
  it('bounce should exist', () => {
    expect(typeof funcStore.bounce).to.equal('function');
  });
  it('orbit should exist', () => {
    expect(typeof funcStore.orbit).to.equal('function');
  });
  it('getCursorPosition should exist', () => {
    expect(typeof funcStore.getCursorPosition).to.equal('function');
  });
  it('setVendorCss should exist', () => {
    expect(typeof funcStore.setVendorCss).to.equal('function');
  });
  it('drawVideo should exist', () => {
    expect(typeof funcStore.drawVideo).to.equal('function');
  });
  it('velocity should exist', () => {
    expect(typeof funcStore.velocity).to.equal('function');
  });
  it('angularVelocity should exist', () => {
    expect(typeof funcStore.angularVelocity).to.equal('function');
  });
  it('appendConnectButtons should exist', () => {
    expect(typeof funcStore.appendConnectButtons).to.equal('function');
  });
  it('removeChildren should exist', () => {
    expect(typeof funcStore.removeChildren).to.equal('function');
  });
  it('clearFunc should exist', () => {
    expect(typeof funcStore.clearFunc).to.equal('function');
  });
  it('toggleZindex should exist', () => {
    expect(typeof funcStore.toggleZindex).to.equal('function');
  });
});


describe('paste functionality', () => {
  let canvas, context, event, position, emoImg, sandbox;
  beforeEach(() => {
    canvas =  document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 450;

    context = canvas.getContext('2d');

    position = {x: 500, y:300};
    emoImg = new Image();
    emoImg.src = 'http://getemoji.com/assets/ico/favicon.png';

    //new sandbox
    sandbox = sinon.sandbox.create();


    afterEach(function () {
    //clear spies
        sandbox.restore();
    });
  });
  it('should be callable', () => {
    let pasteSpy = sandbox.spy(funcStore, 'paste');
    funcStore.paste(canvas, context, event, position, emoImg);
    expect(pasteSpy.called).to.be.true;
  })

  it('should not throw an error', () => {
    let pasteSpy = sandbox.spy(funcStore, 'paste');
    funcStore.paste(canvas, context, event, position, emoImg);
    expect(pasteSpy.threw()).to.be.false;
  })

})

describe('appendConnectButtons functionality', () => {
  let MRGconnectivityBtns, sandbox, conButton, disconButton;
  beforeEach(() => {
    MRGconnectivityBtns = document.createElement('div');
    MRGconnectivityBtns.setAttribute('id', 'MRGconnectivityBtns');
    document.body.appendChild(MRGconnectivityBtns);

    //new sandbox
    sandbox = sinon.sandbox.create();
  });
  afterEach(function () {
      document.body.removeChild(MRGconnectivityBtns);
  //clear spies
      sandbox.restore();
  });
  it('should add elements to the dom', () => {
    funcStore.appendConnectButtons();
    expect(document.getElementById('MRGconnect')).to.not.equal(null);
    expect(document.getElementById('MRGdisconnect')).to.not.equal(null);
  });
  it('should create elements with button type', () => {
    funcStore.appendConnectButtons();
    expect(document.getElementById('MRGconnect').nodeName).to.equal('BUTTON');
    expect(document.getElementById('MRGdisconnect').nodeName).to.equal('BUTTON');
  });
  it('should set the buttons initially as disabled', () => {
    funcStore.appendConnectButtons();
    expect(document.getElementById('MRGconnect').disabled).to.be.true;
    expect(document.getElementById('MRGdisconnect').disabled).to.be.true;
  });
});


describe('removeChildren functionality', () => {
  let MRGconnectivityBtns, sandbox, conButton, disconButton;
  beforeEach(() => {
    MRGconnectivityBtns = document.createElement('div');
    MRGconnectivityBtns.setAttribute('id', 'MRGconnectivityBtns');
    conButton = document.createElement('button');
    conButton.setAttribute('id', 'conButton');
    disconButton = document.createElement('button');
    disconButton.setAttribute('id', 'disconButton');
    MRGconnectivityBtns.appendChild(conButton);
    MRGconnectivityBtns.appendChild(disconButton);
    document.body.appendChild(MRGconnectivityBtns);
  });

  afterEach(() => {
    document.body.removeChild(MRGconnectivityBtns);
  })

  it('should remove one child if it exists', () => {
    expect(document.getElementById('conButton')).to.not.equal(null);
    funcStore.removeChildren('MRGconnectivityBtns');
    expect(document.getElementById('conButton')).to.equal(null);
  });

  it('should remove two child if it exists', () => {
    expect(document.getElementById('conButton')).to.not.equal(null);
    expect(document.getElementById('disconButton')).to.not.equal(null);
    funcStore.removeChildren('MRGconnectivityBtns');
    expect(document.getElementById('conButton')).to.equal(null);
    expect(document.getElementById('disconButton')).to.equal(null);
  });

  it('should work if the children does not exist', () => {
    //first to remove existing children
    funcStore.removeChildren('MRGconnectivityBtns');
    funcStore.removeChildren('MRGconnectivityBtns');
    expect(true).to.be.true;
  });
});

describe('clearFunc functionality', () => {
  it ('should stop all raf', () => {

    let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    let start = window.mozAnimationStartTime;  // Only supported in FF. Other browsers can use something like Date.now().

    let animeSt = {};

    let mediaSt = {};

    mediaSt.myContext = document.createElement('canvas').getContext('2d');
    mediaSt.peerContext = document.createElement('canvas').getContext('2d');

    function step(timestamp) {
      let progress = timestamp - start;
      d.style.left = Math.min(progress/10, 200) + "px";
      if (progress < 2000) {
        animeSt.myReq = requestAnimationFrame(step);
      }
    }
    animeSt.myReq = requestAnimationFrame(step);

    funcStore.clearFunc(animeSt, mediaSt);

  })
});
describe('toggleZindex functionality', () => {
  beforeEach(() => {
    let mirageEl = document.createElement('div');
    mirageEl.setAttribute('id', 'MRG-hello');
    let nonMirageEl = document.createElement('div');
    nonMirageEl.setAttribute('id', 'hello');
    document.body.appendChild(mirageEl);
    document.body.appendChild(nonMirageEl);
  });
  afterEach(() => {
    document.body.removeChild(document.getElementById('MRG-hello'));
    document.body.removeChild(document.getElementById('hello'));
  });

  it('should add the notMirage class if class does not contain MRG', () => {
    expect(document.getElementById('hello').classList.contains('notMirage')).to.be.false;
    funcStore.toggleZindex();
    expect(document.getElementById('hello').classList.contains('notMirage')).to.be.true;
  });

  it('should not add the notMirage class if class does not contain MRG', () => {
    expect(document.getElementById('MRG-hello').classList.contains('notMirage')).to.be.false;
    funcStore.toggleZindex();
    expect(document.getElementById('MRG-hello').classList.contains('notMirage')).to.be.false;
  })

});


//
// function toggleZindex() {
//   // toggle Z index of non MRG elements to have Mirage component always show
//   // only if can access dom elements
//   if (document.querySelectorAll) {
//     let domElements = document.body.getElementsByTagName('*');
//     for (let i = 0; i < domElements.length; i++) {
//       if (domElements[i].id.substring(0,3)!=="MRG") {
//         //give fixed elements z index of 1 and non fixed elements z index of -1 to keep positionality
//         window.getComputedStyle(domElements[i]).getPropertyValue('position')==='fixed' ? domElements[i].classList.toggle('notMirageFixed') : domElements[i].classList.toggle('notMirage');
//       }
//     }
//   }
// }
