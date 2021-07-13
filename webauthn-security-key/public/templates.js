import {
  html,
  render
} from "https://unpkg.com/lit-html@1.0.0/lit-html.js?module";

const notConfiguredHtml = html`
  <p>
    ✖️ Two-factor authentication is not configured (no credentials found). To
    make your account more secure, enable two-factor authentication by adding a
    credential.
  </p>
`;

const configuredHtml = html`
  <p>
    ✅ Two-factor authentication with a security key is configured.
  </p>
`;

const getTitleHtml = credentialsCount => html`
  <h4>
    Credential${credentialsCount > 1 ? "s" : ""} (${credentialsCount})
  </h4>
`;

const getCredentialHtml = (credential, remove, rename) => {
  const { name, credId, publicKey } = credential;
  return html`
    <div class="credential-card">
      <div class="credential-name">
        ${name
          ? html`
              ${name}
            `
          : html`
              <span class="unnamed">(Unnamed)</span>
            `}
      </div>
      <div>
        <label>Credential ID:</label>
        <div class="info">
          ${credId}
        </div>
      </div>
      <div>
        <label>Public Key:</label>
        <pre class="info">${publicKey}</pre>
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
};

export const getCredentialListHtml = (credentials, remove, rename) => html`
  ${credentials.length
    ? html`
        ${configuredHtml} ${getTitleHtml(credentials.length)}
        ${credentials.map(
          cred => html`
            ${getCredentialHtml(cred, remove, rename)}
          `
        )}
      `
    : notConfiguredHtml}
`;
