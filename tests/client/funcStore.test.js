import * as funcStore from '../../components/funcStore';
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
