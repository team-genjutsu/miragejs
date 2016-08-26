import { setVendorCss } from './funcStore';

function filterListener(vid, whoisFilter, currFilter, whoisBool, peerObj) {
  document.getElementById(whoisFilter).addEventListener('click', () => {
    let filterDataObj;
    // sends boolean data about remote filter application and adds filter on your side
    if (!vid.style.filter) {
      filterDataObj = JSON.stringify({
        local: whoisBool,
        addFilter: 'yes',
        filterType: current.innerHTML
      });
      setVendorCss(vid, currFilter.innerHTML);
    } else {
      //instructions to remove filter and send object to data channel
      filterDataObj = JSON.stringify({
        local: whoisBool,
        addFilter: 'no'
      });
      vid.removeAttribute('style');
    }
    peer.send(filterDataObj);
  })
}

export { filterListener };
