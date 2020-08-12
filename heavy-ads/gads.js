'use strict';
// Filename is gads.js to trigger ad detection

// add a timestamp to URLs to prevent caching
const loadedAt = Date.now();
document.querySelectorAll('input.nocache').forEach((e) => { e.setAttribute('value', loadedAt) });

// create an iframe for the add
const frame = document.createElement('iframe');
frame.setAttribute('allow', 'autoplay');
let iframeSrc = '/empty/_ads.html';
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('ad')) {
  // drop in one of the hosted examples
  iframeSrc = urlParams.get('ad') + '?n=' + loadedAt;
} else if (urlParams.get('site')) {
  // or load the user's content
  iframeSrc = '/proxy/_ads.html?site=' + urlParams.get('site');
}

// update the iframe URL and add it to the page
frame.src = iframeSrc;
document.querySelector('main').appendChild(frame);

// Simple reporting mechanism that's just awaiting a postMessage from the ad frame
const unloadMessage = document.createElement('pre');
unloadMessage.textContent = '[Awaiting ReportingObserver reports from iframe…]';
document.querySelector('main').appendChild(unloadMessage);

function handlePostMessage(event) {
  unloadMessage.textContent += '\n' + event.data;
}

window.addEventListener('message', handlePostMessage, false);
