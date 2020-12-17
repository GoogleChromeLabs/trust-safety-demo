import Fingerprint2 from "fingerprintjs2";

const TIMEOUT_MS = 500;
const MAX_CHAR_LENGTH = 15;

const hashEl = document.getElementById("hash");
const fingerprintComponentsEl = document.getElementById("fingerprintComponents");

// main
if (window.requestIdleCallback) {
    requestIdleCallback(() => {
        fingerprint();
    });
} else {
    setTimeout(() => {
      fingerprint();
    }, TIMEOUT_MS);
}

// fingerprint
function fingerprint() {
    Fingerprint2.get((components) => {
        // create a hash fingerprint via hash function
        const hash = Fingerprint2.x64hash128(getHashable(components));
        displayHash(hash);
        displayFingerprintComponents(components);
    });
}


// DOM side effects
function displayHash(hash) {
  hashEl.textContent = hash;
}
function displayFingerprintComponents(components) {
  const componentsList = components.reduce((acc, component) => {
    const {key, value} = component;
    return `${acc} 
      <div class="component">
        <div class="key">${key}</div>
        <div class="value">${value.toString()}</div>
      </div>`;
  }, "");
  // TODO SANITIZE
  fingerprintComponentsEl.innerHTML = componentsList;
}

// fingerprint helpers
function getHashable(components) {
  return components.map(component => component.value).join('');
}