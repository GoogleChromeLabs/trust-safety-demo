const coop = document.querySelector('#coop');
const coep = document.querySelector('#coep');
const corp = document.querySelector('#corp');
const input = document.querySelector('#input');

const coi = self.crossOriginIsolated || window.opener === null;

if (input) {
  document.body.style.backgroundColor = coi ? '#ccccff' : 'white';
  const context = coi ? 'a differnt' : 'the same';
  input.value = `Window is in ${context} browsing context than the parent`;
}

document.addEventListener('DOMContentLoaded', () => {
  const top_url = new URL(location.href);
  let _top_url = `${location.origin}?`;
  ['coep', 'coop', 'corp', 'xfo'].forEach(key => {
    if (top_url.searchParams.has(key)) {
      window[`${key}`].value = top_url.searchParams.get(key);
    }
  });
});

window.addEventListener('message', e => {
  e.source.postMessage('test', '*');
  alert('message received');
});