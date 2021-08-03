/*
 * @license
 * Copyright 2019 Google Inc. All rights reserved.
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

import { decodeServerOptions, encodeCredential } from './encoding.js';

export const _fetch = async (path, payload = '') => {
  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (payload && !(payload instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(payload);
  }
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers,
    body: payload,
  });
  if (res.status === 200) {
    // Server authentication succeeded
    return res.json();
  } else {
    // Server authentication failed
    const result = await res.json();
    throw result.error;
  }
};

export const registerCredential = async (name) => {
  const credentialCreationOptionsFromServer = await _fetch(
    '/auth/registerRequest',
    {
      attestation: 'none',
      authenticatorSelection: {
        // Use "cross-platform" for roaming keys
        authenticatorAttachment: 'cross-platform',
        userVerification: 'discouraged',
        requireResidentKey: 'discouraged',
      },
    }
  );
  const credentialCreationOptions = decodeServerOptions(
    credentialCreationOptionsFromServer
  );

  const credential = await navigator.credentials.create({
    publicKey: credentialCreationOptions,
  });
  const encodedCredential = encodeCredential(credential);
  encodedCredential.name = name;
  encodedCredential.transports = credential.response.getTransports();
  return await _fetch('/auth/registerResponse', encodedCredential);
};

export const renameCredential = async (credId, newName) => {
  return _fetch(
    `/auth/renameCredential?credId=${encodeURIComponent(
      credId
    )}&name=${encodeURIComponent(newName)}`
  );
};

export const removeCredential = async (credId) => {
  return _fetch(`/auth/removeCredential?credId=${encodeURIComponent(credId)}`);
};

export const authenticate2fa = async () => {
  const optionsFromServer = await _fetch('/auth/2faOptions', {
    userVerification: 'discouraged',
  });
  const decodedOptions = decodeServerOptions(optionsFromServer);
  const credential = await navigator.credentials.get({
    publicKey: decodedOptions,
  });
  const encodedCredential = encodeCredential(credential);

  return await _fetch(`/auth/signin2fa`, { credential: encodedCredential });
};
