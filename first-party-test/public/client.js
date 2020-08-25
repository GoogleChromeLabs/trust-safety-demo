import { Main } from './main.js';
import { CrossOriginPopup } from './popup.js';
import { CrossOriginIframe } from './iframe.js';
import { CrossOriginImage } from './image.js';
import { CrossOriginLocalStorage } from './ls.js';
import { toast } from './common.js';

const main = document.querySelector('#main_container');
if (main) {
  new Main(main);  
}

const image = document.querySelector('#image_container');
if (image) {
  new CrossOriginImage(image);
}

const iframe = document.querySelector('#iframe_container');
if (iframe) {
  new CrossOriginIframe(iframe);
}

const popup = document.querySelector('#popup_container');
if (popup) {
  new CrossOriginPopup(popup);
}

const ls = document.querySelector('#ls_container');
if (ls) {
  new CrossOriginLocalStorage(ls);
}

document.addEventListener('DOMContentLoaded', e => {
  const coi = self.crossOriginIsolated || window.opener === null;
  if (coi) {
    toast('`window.opener` is `null`.');
    document.body.style.backgroundColor = '#eeeeff';
  } else {
    toast('`window.opener` found.');
  }  
});
