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

import 'https://cdn.jsdelivr.net/gh/herrjemand/Base64URL-ArrayBuffer@latest/lib/base64url-arraybuffer.js?module';

function encodeCredential(credential) {
  const encodedCredential = {};
  encodedCredential.id = credential.id;
  encodedCredential.rawId = base64url.encode(credential.rawId);
  encodedCredential.type = credential.type;

  if (credential.response) {
    [
      'clientDataJSON',
      'authenticatorData',
      'signature',
      'userHandle',
      'attestationObject',
    ].forEach((property) => {
      if (property) {
        const encodedProperty = base64url.encode(credential.response[property]);
        encodedCredential.response = {
          ...encodedCredential.response,
          [property]: encodedProperty,
        };
      }
    });
  }
  return encodedCredential;
}

function decodeServerOptions(encodedOptions) {
  const decodedOptions = {
    ...encodedOptions,
  };
  if (decodedOptions.user) {
    decodedOptions.user.id = base64url.decode(encodedOptions.user.id);
  }
  if (decodedOptions.challenge) {
    decodedOptions.challenge = base64url.decode(encodedOptions.challenge);
  }
  if (decodedOptions.excludeCredentials) {
    for (let cred of encodedOptions.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }
  if (decodedOptions.allowCredentials) {
    for (let cred of encodedOptions.allowCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }
  return decodedOptions;
}

export { encodeCredential, decodeServerOptions };
