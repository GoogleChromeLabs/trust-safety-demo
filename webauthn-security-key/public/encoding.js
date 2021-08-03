import 'https://cdn.jsdelivr.net/gh/herrjemand/Base64URL-ArrayBuffer@latest/lib/base64url-arraybuffer.js?module';

export const encodeCredential = (credential) => {
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
};

export const decodeServerOptions = (encodedOptions) => {
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
};
