import { TP_BASE_URL, renderOptions } from './common.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export class CrossOriginIframe {
  constructor(parent) {
    this.parent = parent;
    let _url = `${TP_BASE_URL}/iframe?`;

    let val = localStorage.getItem(`iframe_coep`);
    if (val) _url += `coep=${val}&`;
    this.coep = val;

    val = localStorage.getItem(`iframe_corp`);
    if (val) _url += `corp=${val}&`;
    this.corp = val;
    
    val = localStorage.getItem(`iframe_xfo`);
    if (val) _url += `xfo=${val}&`;
    this.xfo = val;

    this.url = _url;
    this.iframe_url = this.url;

    window.addEventListener('message', e => {
      alert('message received');
    });

    this.render();
  }
  render() {
    render(html`
        <iframe id="iframe" src="${this.iframe_url}" width="620" height="200"></iframe><br/>
        <label for="iframe_coep">Cross Origin Embedder Policy</label>
        <select id="iframe_coep" @change="${this.change.bind(this)}">
          ${renderOptions(this.coep, ['--', 'require-corp'])}
        </select><br>
        <label for="iframe_corp">Cross Origin Resource Policy</label>
        <select id="iframe_corp" @change="${this.change.bind(this)}">
          ${renderOptions(this.corp, ['--', 'same-site', 'same-origin', 'cross-origin'])}
        </select><br>
<!--         <label for="iframe_xfo">X-Frame-Options</label>
        <select id="iframe_xfo" @change="${this.change.bind(this)}">
          ${renderOptions(this.xfo, ['--', 'deny', 'sameorigin'])}
        </select><br> -->
        <input type="text" id="iframe_url" style="width:500px" value="${this.url}">
        <mwc-button id="reload_iframe" @click="${this.reload.bind(this)}" raised>Reload the iframe</mwc-button><br/>
        <mwc-button id="postmessage_iframe" @click="${this.postMessage.bind(this)}">Send a postMessage</mwc-button>`, this.parent);
  }
  change(e) {
    let _url = `${TP_BASE_URL}/iframe?`;
    if (e.target.id == 'iframe_coep') this.coep = e.target.value;
    if (e.target.id == 'iframe_corp') this.corp = e.target.value;
    if (e.target.id == 'iframe_xfo') this.xfo = e.target.value;
    if (this.coep) {
      _url += `coep=${encodeURIComponent(this.coep)}&`;
      localStorage.setItem(`iframe_coep`, this.coep);
    } else {
      localStorage.removeItem(`iframe_coep`);
    }
    if (this.corp) {
      _url += `corp=${encodeURIComponent(this.corp)}&`;
      localStorage.setItem(`iframe_corp`, this.corp);
    } else {
      localStorage.removeItem(`iframe_corp`);
    }
    if (this.xfo) {
      _url += `xfo=${encodeURIComponent(this.xfo)}&`;
      localStorage.setItem(`iframe_xfo`, this.xfo);
    } else {
      localStorage.removeItem(`iframe_xfo`);
    }
    this.url = _url;
    this.render();
  }
  reload(e) {
    e.preventDefault();
    const iframe_url = document.querySelector('#iframe_url');
    this.iframe_url = iframe_url.value;
    this.render();
  }
  postMessage() {
    const iframe = document.querySelector('#iframe');
    iframe.contentWindow.postMessage('test', '*');
  }
}
