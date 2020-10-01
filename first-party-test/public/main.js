import { FP_BASE_URL, renderOptions } from './common.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export class Main {
  constructor(parent) {
    this.parent = parent;
    let _url = new URL(location.href);

    ['report-only', 'coep', 'coop', 'corp'].forEach(key => {
      if (key == 'report-only' && _url.searchParams.has('report-only')) {
        this.reportOnly = true;
        return;
      }
      if (_url.searchParams.has(key)) {
        this[key] = _url.searchParams.get(key);
      }
    });

    this.url = location.href;
    // window.addEventListener('message', )
    this.render();
  }
  render() {
    render(html`
        <label for="main_report">Report Only</label>
        <input type="checkbox" id="main_report" ?checked="${this.reportOnly}" @change="${this.change.bind(this)}"/><br/>
        <label for="main_coep">Cross Origin Embedder Policy</label>
        <select id="main_coep" @change="${this.change.bind(this)}">
          ${renderOptions(this.coep, ['--', 'require-corp'])}
        </select><br>
        <label for="main_coop">Cross Origin Opener Policy</label>
        <select id="main_coop" @change="${this.change.bind(this)}">
          ${renderOptions(this.coop, ['--', 'same-origin', 'same-origin-allow-popups', 'unsafe-none'])}
        </select><br>
        <label for="main_corp">Cross Origin Resource Policy</label>
        <select id="main_corp" @change="${this.change.bind(this)}">
          ${renderOptions(this.corp, ['--', 'same-origin', 'same-site', 'cross-origin'])}
        </select><br>
        <input type="text" id="main_url" value="${this.url}" style="width:500px">`, this.parent);
  }
  change(e) {
    let _url = `${location.origin}${location.pathname}?`;
    if (e.target.id == 'main_report') this.reportOnly = e.target.checked;
    if (this.reportOnly) {
      _url += `report-only&`;
    }

    if (e.target.id == 'main_coep') this.coep = e.target.value;
    if (this.coep) {
      _url += `coep=${encodeURIComponent(this.coep)}&`;
    }

    if (e.target.id == 'main_coop') this.coop = e.target.value;
    if (this.coop) {
      _url += `coop=${encodeURIComponent(this.coop)}&`;
    }

    if (e.target.id == 'main_corp') this.corp = e.target.value;
    if (this.corp) {
      _url += `corp=${encodeURIComponent(this.corp)}&`;
    }

    this.url = _url;
    this.reload();
  }
  reload() {
    location.href = this.url;
  }
}
