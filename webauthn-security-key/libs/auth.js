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

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fido2 = require('@simplewebauthn/server');
const base64url = require('base64url');
const fs = require('fs');
const low = require('lowdb');
const { check, validationResult } = require('express-validator');

if (!fs.existsSync('./.data')) {
  fs.mkdirSync('./.data');
}

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
const db = low(adapter);

router.use(express.json());

db.defaults({
  users: [],
}).write();

const RP_NAME = 'webauthn-security-key-codelab';
const FIDO_TIMEOUT = 30 * 1000 * 60;
const VALID_TRANSPORTS = Object.freeze([
  'usb',
  'ble',
  'nfc',
  'internal',
  'cable',
]);

// Authentication types
const authTypes = Object.freeze({
  SINGLE_FACTOR: 'sfa',
  TWO_FACTOR: '2fa',
});

// Authentication statuses
const authStatuses = Object.freeze({
  NEED_SECOND_FACTOR: 'needSecondFactor',
  COMPLETE: 'complete',
});

// Generic message, because an attacker should not be able to determine that a password was correct by looking at the error messages
const GENERIC_AUTH_ERROR_MESSAGE =
  'Username or password incorrect or credential not found or user verification failed';

// ----------------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------------

function isPasswordCorrect(username, password) {
  // Always true, in this demo for simplicity the password isn't actually checked
  return true;
}

function getAuthType(credentials) {
  // If one or more credential are registered, it means by definition that two-factor authentication is set up
  return credentials.length > 0
    ? authTypes.TWO_FACTOR
    : authTypes.SINGLE_FACTOR;
}

function csrfCheck(req, res, next) {
  if (req.header('X-Requested-With') != 'XMLHttpRequest') {
    res.status(400).json({ error: 'Invalid access' });
    return;
  }
  next();
}

function sessionCheck(req, res, next) {
  if (req.session.name !== 'main') {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}

function getOrigin(userAgent) {
  let origin = '';
  if (userAgent.indexOf('okhttp') === 0) {
    const octArray = process.env.ANDROID_SHA256HASH.split(':').map((h) =>
      parseInt(h, 16)
    );
    const androidHash = base64url.encode(octArray);
    origin = `android:apk-key-hash:${androidHash}`;
  } else {
    origin = process.env.ORIGIN;
  }
  return origin;
}

// ----------------------------------------------------------------------------
// Database management and actions
// ----------------------------------------------------------------------------

function findUserByUsername(username) {
  return db.get('users').find({ username }).value();
}

function createUser(user) {
  db.get('users').push(user).write();
}

function updateUser(username, user) {
  db.get('users').find({ username }).assign(user).write();
}

function updateCredentials(username, credentials) {
  db.get('users').find({ username }).assign({ credentials }).write();
}

function createOrGetUser(username) {
  let user = findUserByUsername(username);
  // If the user doesn't exist, create it
  if (!user) {
    user = {
      username,
      id: base64url.encode(crypto.randomBytes(32)),
      credentials: [],
    };
    createUser(user);
  }
  return user;
}

// ----------------------------------------------------------------------------
// Session management
// ----------------------------------------------------------------------------

// Sign out
router.get('/signout', (req, res) => {
  // Remove the session
  req.session.destroy();
  // Redirect to `/`
  res.redirect(307, '/');
});

/**
 * Complete the authentication
 *
 * Input:
 * req.session:
 * {
     username: String,
     isPasswordCorrect: String
 * }
 *
 * Response as JSON:
 * {
     msg: String, 
     authStatus: String // One of authStatuses 
   }
 * or
 * {
     error: String, 
   }
 **/
function completeAuthentication(req, res) {
  // username and isPasswordCorrect come from the first session, 'auth', dedicated to authentication
  const { username, isPasswordCorrect } = req.session;
  if (!username || !isPasswordCorrect) {
    res.status(401).json({ error: GENERIC_AUTH_ERROR_MESSAGE });
    return;
  }
  // Terminate the 'auth' session and start the 'main' session
  // Once the 'main' session is active, the user is considered fully authenticated
  req.session.regenerate(function (err) {
    req.session.name = 'main';
    // Transfer the username from the 'auth' session to the new one 'main'
    req.session.username = username;
  });
  req.session.save(function (err) {
    res.status(200).json({
      msg: 'Authentication complete',
      authStatus: authStatuses.COMPLETE,
    });
  });
}

/**
 * Initialize the authentication: trigger completion or request a second factor, depending on the user's chosen authentication type
 *
 * Input:
 * req.body:
 * {
     username: String,
     password: String,
 * }
 * req.session:
 * {
     username: String,
     ...
 * }
 *
 * Response as JSON:
 * {
     msg: String, 
     authStatus: String // One of authStatuses 
   }
 * or
 * {
     error: String, 
   }
 **/
router.post(
  '/initialize-authentication',
  check('username').notEmpty().isAlphanumeric().escape(),
  check('password').notEmpty().escape(),
  (req, res) => {
    // Validate the input
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json({
        error: 'Username or password is empty or contains invalid characters',
      });
      return;
    }
    const { password, username } = req.body;
    const user = createOrGetUser(username);
    // Set the username in the 'auth' session so that it can be passed to the main session
    req.session.username = username;
    // Set the password correctness value for the next step
    req.session.isPasswordCorrect = isPasswordCorrect(username, password);
    // If 2FA is not set up, complete the authentication
    const authType = getAuthType(user.credentials);
    if (authType === authTypes.SINGLE_FACTOR) {
      completeAuthentication(req, res);
      // If 2FA is set up, respond with a signal that the second factor is missing
    } else if (authType === authTypes.TWO_FACTOR) {
      // Set the authStatus in the session so that it can be checked in server.js
      req.session.authStatus = authStatuses.NEED_SECOND_FACTOR;
      // And set it in the response so that it can be checked by the client
      res.status(200).json({
        msg: 'Need two factors because two-factor-authentication was configured for this account',
        authStatus: authStatuses.NEED_SECOND_FACTOR,
      });
    } else {
      res.status(500).json({ error: 'Unkown authentication type' });
    }
  }
);

/**
 * Get options that are required to call navigator.credential.get()
 *
 * Input:
 * req.body: similar format as output
 *
 * Response:
 * {
     challenge: String,
     userVerification: String, // ('required'|'preferred'|'discouraged'),
     allowCredentials: [{
       id: String,
       type: 'public-key',
       transports: String[], // One or several of https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialdescriptor-transports 
     }, ...]
 * }```
 **/
router.post('/two-factor-options', csrfCheck, async (req, res) => {
  try {
    const user = findUserByUsername(req.session.username);
    const userVerification = req.body.userVerification || 'required';
    const allowCredentials = [];
    for (let cred of user.credentials) {
      allowCredentials.push({
        id: cred.credId,
        type: 'public-key',
        transports: cred.transports,
      });
    }
    const options = fido2.generateAssertionOptions({
      timeout: FIDO_TIMEOUT,
      rpID: process.env.HOSTNAME,
      allowCredentials,
      // userVerification is an optional value that controls whether or not the authenticator needs be able to uniquely
      // identify the user interacting with it (via built-in PIN pad, fingerprint scanner, etc...)
      userVerification,
    });
    req.session.challenge = options.challenge;

    res.status(200).json(options);
  } catch (e) {
    res.status(400).json({
      error: `Getting two-factor authentication options failed: ${GENERIC_AUTH_ERROR_MESSAGE}`,
    });
  }
});

/**
 * Authenticate the user
 *
 * Input:
 * req.body.credential:
 * {
     id: String,
     type: String, // E,g. 'public-key'
     rawId: String,
     response: {
       clientDataJSON: String,
       authenticatorData: String,
       signature: String,
       userHandle: String
     }
 * }
 **/
router.post('/authenticate-two-factor', csrfCheck, async (req, res) => {
  const { body } = req;
  const { credential: credentialFromClient } = body;
  const expectedOrigin = getOrigin(req.get('User-Agent'));
  const expectedRPID = process.env.HOSTNAME;
  const {
    username,
    isPasswordCorrect,
    challenge: expectedChallenge,
  } = req.session;
  if (!username || !isPasswordCorrect) {
    res.status(401).json({
      error: `Authentication failed: ${GENERIC_AUTH_ERROR_MESSAGE}`,
    });
  }
  const user = findUserByUsername(username);
  let credentialFromServer = user.credentials.find(
    (cred) => cred.credId === credentialFromClient.id
  );
  if (!credentialFromServer) {
    res.status(401).json({
      error: `Authentication failed: ${GENERIC_AUTH_ERROR_MESSAGE}`,
    });
  }
  try {
    const verification = fido2.verifyAssertionResponse({
      credential: credentialFromClient,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      authenticator: credentialFromServer,
    });
    const { verified, authenticatorInfo } = verification;
    if (!verified) {
      res.status(401).json({
        error: `Authentication failed: ${GENERIC_AUTH_ERROR_MESSAGE}`,
      });
    }
    credentialFromServer.prevCounter = authenticatorInfo.counter;
    updateUser(username, user);
    delete req.session.challenge;
    completeAuthentication(req, res);
  } catch (e) {
    delete req.session.challenge;
    res.status(400).json({ error: e.message });
  }
});

// ----------------------------------------------------------------------------
// Credential management
// ----------------------------------------------------------------------------

/**
 * Return a user and their credentials
 *
 * Input:
 * req.session:
 * {
     username: String,
     ...
 * }
 *
 * Response:
 * {
    username: String,
    credentials: Credential[]
 * }
 * Credential:
 * {
    credId: String,
    publicKey: String,
    aaguid: String,
    prevCounter: Int
 * }
**/
router.get('/credentials', csrfCheck, sessionCheck, (req, res) => {
  const { username } = req.session;
  const user = findUserByUsername(username);
  res.status(200).json(user || {});
});

/**
 * Remove a credential attached to the user
 *
 * Input:
 * req.session:
 * {
     username: String,
     ...
 * }
 * req.query:
 * {
     credId: String,
     ...
 * }
 *
 * Response: empty JSON
 **/
router.delete('/credential', csrfCheck, sessionCheck, (req, res) => {
  const { credId } = req.query;
  const { username } = req.session;
  const user = findUserByUsername(username);
  const updatedCredentials = user.credentials.filter((cred) => {
    return cred.credId !== credId;
  });
  updateCredentials(username, updatedCredentials);
  res.status(200).json(user || {});
});

/**
 * Update an existing credential's name
 *
 * Input:
 * req.session:
 * {
     username: String,
     ...
 * }
 * req.query:
 * {
     name: String,
     credId: String,
     ...
 * }
 *
 * Response: 
 * User as JSON string
 **/
router.put(
  '/credential',
  csrfCheck,
  sessionCheck,
  check('credId').escape(),
  check('name').notEmpty().escape(),
  (req, res) => {
    // Validate the input
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({ error: validationErrors.array() });
    }
    // Rename the credential
    const { credId, name: newName } = req.query;
    try {
      const { username } = req.session;
      const user = findUserByUsername(username);
      const { credentials } = user;
      const indexOfCredentialToUpdate = credentials.findIndex(
        (el) => el.credId === credId
      );
      // Change the credential name on a copy of the credentials
      const updatedCredentials = [...credentials];
      updatedCredentials[indexOfCredentialToUpdate].name = newName;
      // Update the stored credentials with the copy
      updateCredentials(username, updatedCredentials);
      res.status(200).json(user);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

/**
 * Register a new credential
 *
 * Input: 
 * req.session:
 * {
     challenge: String,
     username: String,
     ...
 * }
 * req.body:
 * {
     id: String, // New credential's ID
     type: String, // E.g. 'public-key'
     rawId: ArrayBuffer,
     response: {
       clientDataJSON: String, 
       attestationObject: String, 
       signature: String, 
       userHandle: String, 
     }
     transports: String[], // One or several of https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialdescriptor-transports 
 * }
 * 
 * Response: 
 * User as JSON string
 **/
router.post(
  '/credential',
  csrfCheck,
  sessionCheck,
  check('credId').escape(),
  check('name').notEmpty().escape(),
  check('transports').isIn(VALID_TRANSPORTS),
  async (req, res) => {
    const { challenge: expectedChallenge, username } = req.session;
    const { body } = req;
    const { id: credId, name, transports } = body;
    const expectedOrigin = getOrigin(req.get('User-Agent'));
    const expectedRPID = process.env.HOSTNAME;

    try {
      // Verify the user via fido
      const verification = await fido2.verifyAttestationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin,
        expectedRPID,
      });
      const { verified, authenticatorInfo } = verification;
      if (!verified) {
        return res.status(400).json({ error: 'User verification failed' });
      }
      // Validate the input
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ error: validationErrors.array() });
      }
      const { base64PublicKey, base64CredentialID, counter } =
        authenticatorInfo;
      const user = findUserByUsername(username);
      const existingCred = user.credentials.find(
        (cred) => cred.credID === base64CredentialID
      );
      if (!existingCred) {
        // Add the returned device to the user's list of devices
        user.credentials.push({
          publicKey: base64PublicKey,
          credId: base64CredentialID,
          prevCounter: counter,
          name,
          transports,
          creationDate: Date.now(),
        });
      }
      updateUser(username, user);
      delete req.session.challenge;
      // Respond with user data
      res.json(user);
    } catch (e) {
      delete req.session.challenge;
      res.status(400).json({ error: e.message });
    }
  }
);

/**
 * Get options that are required to call navigator.credential.create()
 *
 * Input: 
 * req.session:
 * {
     username: String,
     ...
 * }
 *
 * Response: 
 * {
     rp: {
       id: String,
       name: String
     },
     user: {
       displayName: String,
       id: String,
       name: String
     },
     publicKeyCredParams: [{
       type: 'public-key', alg: -7
     }],
     timeout: Number,
     challenge: String,
     excludeCredentials: [{
       id: String,
       type: 'public-key',
       transports: String[], // One or several of https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialdescriptor-transports 
     }, ...],
     authenticatorSelection: {
       authenticatorAttachment: String,
       requireResidentKey: Boolean,
       userVerification: String // 'required'|'preferred'|'discouraged'
     },
     attestation: String // 'none'|'indirect'|'direct'
 * }
 **/
router.post(
  '/credential-options',
  csrfCheck,
  sessionCheck,
  async (req, res) => {
    const { username } = req.session;
    const user = findUserByUsername(username);
    try {
      const excludeCredentials = [];
      if (user.credentials.length > 0) {
        for (let cred of user.credentials) {
          excludeCredentials.push({
            id: cred.credId,
            type: 'public-key',
            transports: cred.transports,
          });
        }
      }
      const as = {}; // authenticatorSelection
      const aa = req.body.authenticatorSelection.authenticatorAttachment;
      const rr = req.body.authenticatorSelection.requireResidentKey;
      const uv = req.body.authenticatorSelection.userVerification;
      const cp = req.body.attestation; // attestationConveyancePreference
      let asFlag = false;
      let authenticatorSelection;
      let attestation = 'none';

      if (aa && (aa == 'platform' || aa == 'cross-platform')) {
        asFlag = true;
        as.authenticatorAttachment = aa;
      }
      if (rr && typeof rr == 'boolean') {
        asFlag = true;
        as.requireResidentKey = rr;
      }
      if (
        uv &&
        (uv == 'required' || uv == 'preferred' || uv == 'discouraged')
      ) {
        asFlag = true;
        as.userVerification = uv;
      }
      if (asFlag) {
        authenticatorSelection = as;
      }
      if (cp && (cp == 'none' || cp == 'indirect' || cp == 'direct')) {
        attestation = cp;
      }

      const options = fido2.generateAttestationOptions({
        rpName: RP_NAME,
        rpID: process.env.HOSTNAME,
        userID: user.id,
        userName: username,
        timeout: FIDO_TIMEOUT,
        // Prompt user for additional information about the authenticator
        attestationType: attestation,
        // Prevent user from re-registering existing authenticators
        excludeCredentials,
        authenticatorSelection,
        // As per https://www.w3.org/TR/webauthn-2/
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
          {
            type: 'public-key',
            alg: -257,
          },
        ],
      });
      req.session.challenge = options.challenge;
      res.status(200).json(options);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

module.exports = router;
