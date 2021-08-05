/*
 * @license
 * Copyright 2021 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

import {
  html,
  render,
} from 'https://unpkg.com/lit-html@1.0.0/lit-html.js?module';

const notConfiguredHtml = html`
  <p>
    ✖️ Two-factor authentication is not configured (no credentials found). To
    make your account more secure, enable two-factor authentication by adding a
    credential.
  </p>
`;

const configuredHtml = html`
  <p>✅ Two-factor authentication with a security key is configured.</p>
`;

const getTitleHtml = (credentialsCount) => html`
  <h4>Credential${credentialsCount > 1 ? 's' : ''} (${credentialsCount})</h4>
`;

function getCredentialHtml(credential, remove, rename) {
  const { name, credId, publicKey, creationDate } = credential;
  return html`
    <div class="credential-card">
      <div class="credential-name">
        ${name
          ? html` ${name} `
          : html` <span class="unnamed">(Unnamed)</span> `}
      </div>
      <div>
        <label>Created:</label>
        <div class="info">
          ${new Date(creationDate).toLocaleDateString()}
          ${new Date(creationDate).toLocaleTimeString()}
        </div>
      </div>
      <div class="flex-end">
        <button
          data-credential-id="${credId}"
          data-credential-name="${name}"
          @click="${rename}"
          class="secondary right"
        >
          ✏️ Rename
        </button>
        <button
          data-credential-id="${credId}"
          @click="${remove}"
          class="secondary remove right"
        >
          🗑 Remove
        </button>
      </div>
    </div>
  `;
}

function getCredentialListHtml(credentials, remove, rename) {
  return html`
    ${credentials.length
      ? html`
          ${configuredHtml} ${getTitleHtml(credentials.length)}
          ${credentials.map(
            (cred) => html` ${getCredentialHtml(cred, remove, rename)} `
          )}
        `
      : notConfiguredHtml}
  `;
}

export { getCredentialListHtml };
