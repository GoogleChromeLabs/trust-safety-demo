import { html, render } from 'https://unpkg.com/lit-html?module';

export const FP_BASE_URL = 'https://first-party-test.glitch.me';
export const TP_BASE_URL = 'https://third-party-test.glitch.me';

export const renderOptions = (value, options) => {
  return html`${options.map(option =>
    html`<option value="${option == '--' ? '' : option}" ?selected="${value == option}">${option}</option> `
  )}`;
};

export const toast = text => {
  const snackbar = document.querySelector('#toast');
  if (snackbar) {
    snackbar.labelText = text;
    snackbar.show();
  }
}