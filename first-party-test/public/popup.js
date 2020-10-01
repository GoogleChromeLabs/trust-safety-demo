import { TP_BASE_URL, renderOptions } from './common.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export class CrossOriginPopup {
  constructor(parent) {
    this.parent = parent;
    let _url = `${TP_BASE_URL}/popup?`;

    let val = localStorage.getItem(`popup_report`);
    if (val) _url += `report-only&`;
    this.reportOnly = val;

    val = localStorage.getItem(`popup_coep`);
    if (val) _url += `coep=${val}&`;
    this.coep = val;

    val = localStorage.getItem(`popup_coop`);
    if (val) _url += `coop=${val}&`;
    this.coop = val;
    this.url = _url;

    window.addEventListener('message', e => {
      // alert('message received');
    });

    this.render();
  }
  render() {
    render(html`
        <label for="popup_report">Report Only</label>
        <input type="checkbox" id="popup_report" ?checked="${this.reportOnly}" @change="${this.change.bind(this)}"/><br/>
        <label for="popup_coep">Cross Origin Embedder Policy</label>
        <select id="popup_coep" @change="${this.change.bind(this)}">
          ${renderOptions(this.coep, ['--', 'require-corp'])}
        </select><br>
        <label for="popup_coop">Cross Origin Opener Policy</label>
        <select id="popup_coop" @change="${this.change.bind(this)}">
          ${renderOptions(this.coop, ['--', 'same-origin', 'same-origin-allow-popups', 'unsafe-none'])}
        </select><br>
        <input type="text" id="popup_url" .value="${this.url}" style="width:500px">
        <mwc-button id="open_popup" @click="${this.open.bind(this)}" raised>
          Open a popup
        </mwc-button><br/>
        <mwc-button id="postmessage_popup" @click="${this.postMessage.bind(this)}">
          Send a postMessage
        </mwc-button>`, this.parent);
  }
  change(e) {
    let _url = `${TP_BASE_URL}/popup?`;

    if (e.target.id == 'popup_report') this.reportOnly = e.target.checked;
    if (this.reportOnly) {
      localStorage.setItem(`popup_report`, 'true');
      _url += `report-only&`;
    } else {
      localStorage.removeItem(`popup_report`);
    }

    if (e.target.id == 'popup_coep') this.coep = e.target.value;
    if (this.coep) {
      _url += `coep=${encodeURIComponent(this.coep)}&`;
      localStorage.setItem(`popup_coep`, this.coep);
    } else {
      localStorage.removeItem(`popup_coep`);
    }

    if (e.target.id == 'popup_coop') this.coop = e.target.value;
    if (this.coop) {
      _url += `coop=${encodeURIComponent(this.coop)}&`;
      localStorage.setItem(`popup_coop`, this.coop);
    } else {
      localStorage.removeItem(`popup_coop`);
    }
    this.url = _url;
    this.render();
  }
  open() {
    const popup_url = document.querySelector('#popup_url');
    this.popup = window.open(popup_url.value, 'popup', 'width=420, height=420');
  }
  postMessage() {
    if (this.popup) {
      this.popup.postMessage('test', '*'); 
    }
  }
}
