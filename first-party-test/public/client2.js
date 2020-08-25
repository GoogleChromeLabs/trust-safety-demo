const TP_BASE_URL = 'https://third-party-test.glitch.me';
const _report = document.querySelector('#_report');
const _coop = document.querySelector('#_coop');
const _coep = document.querySelector('#_coep');
const corp1 = document.querySelector('#corp1');
const coep2 = document.querySelector('#coep2');
const corp2 = document.querySelector('#corp2');
const xfo2 = document.querySelector('#xfo2');
const coop3 = document.querySelector('#coop3');
const coep3 = document.querySelector('#coep3');
const _url = document.querySelector('#_url');
const image_url = document.querySelector('#image_url');
const iframe_url = document.querySelector('#iframe_url');
const popup_url = document.querySelector('#popup_url');
const postmessage_iframe = document.querySelector('#postmessage_iframe');
const postmessage_popup = document.querySelector('#postmessage_popup');
const image = document.querySelector('#image');
const iframe = document.querySelector('#iframe');
let popup = null;

/**
 * URL construction
 **/

const _getURL = () => {
  let query = '';
  if (_report && _report.checked) query += `report&`;
  if (_coop && _coop.value) query += `coop=${encodeURIComponent(_coop.value)}&`;
  if (_coep && _coep.value) query += `coep=${encodeURIComponent(_coep.value)}`;
  const __url = `${location.origin}${location.pathname}?${query}`;
  location.href = __url;
  return __url;
}

const getURL1 = () => {
  let query = '';
  if (corp1 && corp1.value) {
    query += `corp=${encodeURIComponent(corp1.value)}`;
    localStorage.setItem('corp1', corp1.value);
  } else {
    localStorage.removeItem('corp1');
  }
  const _url = `${TP_BASE_URL}/check.svg?${query}`;
  image_url.value = _url
  return _url;
}

const getURL2 = () => {
  let _url = `${TP_BASE_URL}/iframe?`;
  ['coep2', 'corp2', 'xfo2'].forEach(key => {
    if (window[key] && window[key].value) {
      _url += `${key.slice(0, -1)}=${encodeURIComponent(window[key].value)}&`;
      localStorage.setItem(key, window[key].value);
    } else {
      localStorage.removeItem(key);
    }
  });
  iframe_url.value = _url
  return _url;
}

const getURL3 = () => {
  let _url = `${TP_BASE_URL}/popup?`;
  ['coop3', 'coep3'].forEach(key => {
    if (window[key] && window[key].value) {
      _url += `${key.slice(0, -1)}=${encodeURIComponent(window[key].value)}&`;
      localStorage.setItem(key, window[key].value);
    } else {
      localStorage.removeItem(key);
    }
  });
  popup_url.value = _url
  return _url;
}

/**
 * Listening events
 **/

[_report, _coop, _coep].forEach(elem => {
  if (elem) elem.addEventListener('change', e => _getURL());
});

[corp1].forEach(elem => {
  if (elem) elem.addEventListener('change', e => getURL1());
});

[coep2, corp2, xfo2].forEach(elem => {
  if (elem) elem.addEventListener('change', e => getURL2());  
});

[coop3, coep3].forEach(elem => {
  if (elem) elem.addEventListener('change', e => getURL3());  
});

['iframe', 'popup'].forEach(_elem => {
  const elem = window[`postmessage_${_elem}`];
  if (elem) elem.addEventListener('click', e => {
    e.preventDefault();
    if (_elem == 'iframe' && iframe) {
      iframe.contentWindow.postMessage('test', '*');
    } else if (_elem == 'popup' && popup) {
      popup.postMessage('test', '*');
    }
  });
});

window.addEventListener('message', e => {
  if (e.origin !== 'https://third-party-test.glitch.me') return;
  alert('message received');
});

/**
 * Reloading
 **/

const reload_image = document.querySelector('#reload_image');
if (reload_image) {
  reload_image.addEventListener('click', e => {
    e.preventDefault();
    image.src = getURL1();
  });  
}

const reload_iframe = document.querySelector('#reload_iframe');
if (reload_iframe) {
  reload_iframe.addEventListener('click', e => {
    e.preventDefault();
    iframe.src = getURL2();
  });  
}

const open_popup = document.querySelector('#open_popup');
if (open_popup) {
  open_popup.addEventListener('click', e => {
    e.preventDefault();
    popup = window.open(getURL3(), 'popup', 'width=420, height=420');
  });
}

/**
 * Initialization
 **/

document.addEventListener('DOMContentLoaded', () => {
  const top_url = new URL(location.href);
  ['report', 'coep', 'coop'].forEach(key => {
    if (key == 'report' && top_url.searchParams.has('report')) {
      _report.checked = true;
      return;
    }
    if (top_url.searchParams.has(key)) {
      window[`_${key}`].value = top_url.searchParams.get(key);
    }
  });
  if (_url) _url.value = location.href;

  let _image_url = `${TP_BASE_URL}/check.svg?`;
  ['corp1'].forEach(key => {
    const val = localStorage.getItem(key);
    if (val && window[key]) {
      _image_url += `${key.slice(0, -1)}=${val}&`;
      window[key].value = val;
    }
  });
  if (image) {
    image_url.value = _image_url;
    image.src = _image_url;    
  }

  let _iframe_url = `${TP_BASE_URL}/iframe?`;
  ['coep2', 'corp2', 'xfo2'].forEach(key => {
    const val = localStorage.getItem(key);
    if (val && window[key]) {
      _iframe_url += `${key.slice(0, -1)}=${val}&`;
      window[key].value = val;
    }
  });
  if (iframe) {
    iframe_url.value = _iframe_url;
    iframe.src = _iframe_url;    
  }

  let _popup_url = `${TP_BASE_URL}/popup?`;
  ['coop3', 'coep3'].forEach(key => {
    const val = localStorage.getItem(key);
    if (val && window[key]) {
      _popup_url += `${key.slice(0, -1)}=${val}&`;
      window[key].value = val;
    }
  });
  if (popup_url) popup_url.value = _popup_url;
});
