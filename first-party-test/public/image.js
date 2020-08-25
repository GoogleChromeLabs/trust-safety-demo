import { TP_BASE_URL, renderOptions } from './common.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export class CrossOriginImage {
  constructor(parent) {
    this.parent = parent;
    let _url = `${TP_BASE_URL}/check.svg?`;

    let val = localStorage.getItem(`image_corp`);
    if (val) _url += `corp=${val}&`;
    this.corp = val;

    this.url = _url;
    this.image_url = this.url;
    // window.addEventListener('message', )
    this.render();
  }
  render() {
    render(html`
        <img id="image" src="${this.image_url}" width="100" height="100"><br/>
        <label for="image_corp">Cross Origin Resource Policy</label>
        <select id="image_corp" @change="${this.change.bind(this)}">
          ${renderOptions(this.corp, ['--', 'same-site', 'same-origin', 'cross-origin'])}
        </select><br>
        <input type="text" id="image_url" style="width:500px" value="${this.url}">
        <mwc-button id="reload_image" @click="${this.reload.bind(this)}" raised>Reload the image</mwc-button>`, this.parent);
  }
  change(e) {
    let _url = `${TP_BASE_URL}/check.svg?`;
    if (e.target.id == 'image_corp') this.corp = e.target.value;
    if (this.corp) {
      _url += `corp=${encodeURIComponent(this.corp)}&`;
      localStorage.setItem(`image_corp`, this.corp);
    } else {
      localStorage.removeItem(`image_corp`);
    }
    this.url = _url;
    this.render();
  }
  reload() {
    const image_url = document.querySelector('#image_url');
    this.image_url = image_url.value;
    this.render();
  }
}
