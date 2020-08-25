import { TP_BASE_URL, renderOptions, toast } from './common.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export class CrossOriginLocalStorage {
  constructor(parent) {
    this.parent = parent;
    let text = localStorage.getItem(`ls_text`) || '';
    this.text = text;
    this.ls_text = this.text;
    // window.addEventListener('message', )
    this.render();
  }
  render() {
    render(html`
        <label for="ls_text">Local Storage</label>
        ${this.ls_text}<br>
        <input type="text" id="ls_text" value="${this.text}">
        <mwc-button @click="${this.store.bind(this)}" raised>Store the text</mwc-button>`, this.parent);
  }
  store(e) {
    this.text = document.querySelector('#ls_text').value;
    if (this.text) {
      localStorage.setItem(`ls_text`, this.text);
    } else {
      localStorage.removeItem(`ls_text`);
    }
    toast('local storage updated.');
    this.render();
  }
  reload() {
    const ls_text = document.querySelector('#ls_text');
    this.ls_text = ls_text.value;
    this.render();
  }
}
