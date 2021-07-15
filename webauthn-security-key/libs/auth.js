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
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fido2 = require("@simplewebauthn/server");
const base64url = require("base64url");
const fs = require("fs");
const low = require("lowdb");

if (!fs.existsSync("./.data")) {
  fs.mkdirSync("./.data");
}

const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(".data/db.json");
const db = low(adapter);

router.use(express.json());

const RP_NAME = "webAuthn-security-key-codelab";
const FIDO_TIMEOUT = 30 * 1000 * 60;

const SINGLE_FACTOR = "sfa";
const TWO_FACTOR = "2fa";

db.defaults({
  users: []
}).write();

// ----------------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------------

function isPasswordCorrect(username, password) {
  // True because in this demo the password isn't checked, for simplicity
  return true;
}

function getAuthType(credentials) {
  // If one or more credential are registered, two-factor is set up
  // If no credential is registered, single factor
  return credentials.length > 0 ? TWO_FACTOR : SINGLE_FACTOR;
}

const csrfCheck = (req, res, next) => {
  if (req.header("X-Requested-With") != "XMLHttpRequest") {
    res.status(400).json({ error: "Invalid access" });
    return;
  }
  next();
};

const sessionCheck = (req, res, next) => {
  // Basic session check (at least the password is needed i.e. is at least partly signed in)
  // If the session doesn't contain a username, consider the user is not authenticated.
  if (!req.session.username) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  next();
};

const getOrigin = userAgent => {
  let origin = "";
  if (userAgent.indexOf("okhttp") === 0) {
    const octArray = process.env.ANDROID_SHA256HASH.split(":").map(h =>
      parseInt(h, 16)
    );
    const androidHash = base64url.encode(octArray);
    origin = `android:apk-key-hash:${androidHash}`;
  } else {
    origin = process.env.ORIGIN;
  }
  return origin;
};

// ----------------------------------------------------------------------------
// Database management and actions
// ----------------------------------------------------------------------------

router.get("/resetDB", (req, res) => {
  db.set("users", []).write();
  const users = db.get("users").value();
  res.status(200).json(users);
});

function findUserByUsername(username) {
  return db
    .get("users")
    .find({ username })
    .value();
}

function updateCredentials(username, credentials) {
  db.get("users")
    .find({ username })
    .assign({ credentials })
    .write();
}

function updateUser(username, user) {
  db.get("users")
    .find({ username })
    .assign(user)
    .write();
}

// ----------------------------------------------------------------------------
// Session management
// ----------------------------------------------------------------------------

// Sign out
router.get("/signout", (req, res) => {
  // Remove the session
  req.session.destroy();
  // Redirect to `/`
  res.redirect(302, "/");
});

// Start the intermediate session "auth", dedicated to authentication/login
router.post("/start", (req, res) => {
  req.session.name = "auth";
  // "auth" expires after 3 minutes, this means the user has 3 minutes to authenticate
  const sessionLength = 3 * 60 * 1000;
  req.session.cookie.expires = new Date(Date.now() + sessionLength);
  res.status(200).json({
    message: `${req.session.name} session initiated (ID: ${req.session.id})`
  });
});

// Basic sign in, with a password
router.post("/signinBasic", (req, res) => {
  const { password, username } = req.body;
  if (!username || !/[a-zA-Z0-9-_]+/.test(username) || !password) {
    res.status(400).json({
      error: "Missing username or password"
    });
    return;
  } else {
    // Check if the account already exists
    let user = db
      .get("users")
      .find({ username: username })
      .value();
    // If not, create this user
    if (!user) {
      user = {
        username: username,
        id: base64url.encode(crypto.randomBytes(32)),
        credentials: []
      };
      db.get("users")
        .push(user)
        .write();
    }
    // Set the username in the auth session so that it can be passed to the main session
    req.session.username = username;
    // Check if the password is correct
    req.session.isPasswordCorrect = isPasswordCorrect(username, password);
    // If 2fa is not set up, complete the authentication
    const authType = getAuthType(user.credentials);
    if (authType === SINGLE_FACTOR) {
      if (req.session.isPasswordCorrect) {
        completeAuthentication(req, res);
      } else {
        res.status(403).json({ message: "Wrong username or password", authStatus: "nok" });
      }
    // If 2fa is set up, ask for a second factor
    } else if (authType === TWO_FACTOR) {
      res.status(200).json({
        message: "Basic signin completed, 2f missing",
        authStatus: "2fmissing"
      });
    } else {
      throw new Error("Unkown authentication type");
    }
  }
});

// Complete the authentication
function completeAuthentication(req, res) {
  const usernameFromAuthSession = req.session.username;
  if (!usernameFromAuthSession) {
    res.status(500).json({
      message: "No username found"
    });
    return;
  }
  // Terminate the 'auth' session and start the 'main' session
  // Once the 'main' session is active, this means the user is fully signed in
  req.session.regenerate(function(err) {
    req.session.name = "main";
    // Transfer the username from the old session
    req.session.username = usernameFromAuthSession;
  });
  req.session.save(function(err) {
    res.status(200).json({ message: "Fully signed in", authStatus: "ok" });
  });
}

/**
 * Respond with required information to call navigator.credential.get()
 * Input is passed via `req.body` with similar format as output
 * Output format:
 * ```{
     challenge: String,
     userVerification: ('required'|'preferred'|'discouraged'),
     allowCredentials: [{
       id: String,
       type: 'public-key',
       transports: [('ble'|'nfc'|'usb'|'internal'), ...]
     }, ...]
 * }```
 **/
router.post("/2faOptions", csrfCheck, async (req, res) => {
  // Only check the password here, so that the frontend doesn't
  // behave differently when the password is correct vs incorrect
  if (!req.session.isPasswordCorrect) {
    res.status(400).json({ error: "" });
  }
  try {
    const user = findUserByUsername(req.session.username);
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }
    const credId = req.query.credId;
    const userVerification = req.body.userVerification || "required";
    const allowCredentials = [];
    for (let cred of user.credentials) {
      if (!credId || cred.credId == credId) {
        allowCredentials.push({
          id: cred.credId,
          type: "public-key",
          transports: cred.transports
        });
      }
    }
    const options = fido2.generateAssertionOptions({
      timeout: FIDO_TIMEOUT,
      rpID: process.env.HOSTNAME,
      allowCredentials,
      // This optional value controls whether or not the authenticator needs be able to uniquely
      // identify the user interacting with it (via built-in PIN pad, fingerprint scanner, etc...)
      userVerification
    });
    req.session.challenge = options.challenge;

    res.status(200).json(options);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

/**
 * Authenticate the user
 * Input format:
 * ```{
     id: String,
     type: 'public-key',
     rawId: String,
     response: {
       clientDataJSON: String,
       authenticatorData: String,
       signature: String,
       userHandle: String
     }
 * }```
 **/
router.post("/signin2fa", csrfCheck, async (req, res) => {
  const { body } = req;
  const { credential: credentialFromClient } = body;
  const expectedOrigin = getOrigin(req.get("User-Agent"));
  const expectedRPID = process.env.HOSTNAME;
  const { username, isPasswordCorrect, challenge: expectedChallenge } = req.session;

  const user = findUserByUsername(username);
  let credentialFromServer = user.credentials.find(cred => cred.credId === credentialFromClient.id);
  try {
    const verification = fido2.verifyAssertionResponse({
      credential: credentialFromClient,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      authenticator: credentialFromServer
    });
    const { verified, authenticatorInfo } = verification;
    // Intentionally vague message, because an attacker should not
    // be able to determine that a password was correct via changing user messages
    if (!credentialFromServer || !verified || !isPasswordCorrect)  {
      throw new Error("Authenticating credential not found, or user verification failed, or something else went wrong");
    }
    credentialFromServer.prevCounter = authenticatorInfo.counter;
    updateUser(username, user);
    delete req.session.challenge;
    completeAuthentication(req, res);
  } catch (e) {
    delete req.session.challenge;
    res.status(400).json({ error: e });
  }
});

// ----------------------------------------------------------------------------
// Credential management
// ----------------------------------------------------------------------------

/**
 * Return a user and their credentials
 * (This server only stores one key per username)
 * Response:
 * ```{
 *   username: String,
 *   credentials: [Credential]
 * }```

 Credential
 ```
 {
   credId: String,
   publicKey: String,
   aaguid: ??,
   prevCounter: Int
 };
 ```
 **/
router.post("/getCredentials", csrfCheck, sessionCheck, (req, res) => {
  const user = findUserByUsername(req.session.username);
  res.status(200).json(user || {});
});

/**
 * Remove a credential id attached to the user
 * Response: empty JSON `{}`
 **/
router.post("/removeCredential", csrfCheck, sessionCheck, (req, res) => {
  const credId = req.query.credId;
  const username = req.session.username;
  const user = findUserByUsername(username);
  const updatedCredentials = user.credentials.filter(cred => {
    return cred.credId !== credId;
  });
  updateCredentials(username, updatedCredentials);
  res.status(200).json({});
});

/**
 * Update existing credential
 * Input: {
     id: String,
     newName: String
 * }```
 * Response: user as JSON
 **/
router.post("/renameCredential", csrfCheck, sessionCheck, (req, res) => {
  const { credId, name: newName } = req.query;

  try {
    const username = req.session.username;
    const user = findUserByUsername(username);
    const { credentials } = user;
    const indexOfCredentialToUpdate = credentials.findIndex(
      el => el.credId === credId
    );
    const updatedCredentials = [...credentials];
    updatedCredentials[indexOfCredentialToUpdate].name = newName;
    updateCredentials(username, updatedCredentials);
    res.json(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

/**
 * Register user credential.
 * Input format:
 * ```{
     id: String,
     type: 'public-key',
     rawId: String,
     response: {
       clientDataJSON: String,
       attestationObject: String,
       signature: String,
       userHandle: String
     }
 * }```
 **/
router.post("/registerResponse", csrfCheck, sessionCheck, async (req, res) => {
  const {challenge: expectedChallenge, username } = req.session;
  const {id: credId, name, transports, type} = req.body;
  const expectedOrigin = getOrigin(req.get("User-Agent"));
  const expectedRPID = process.env.HOSTNAME;
  
  try {
    const { body } = req;
    const verification = await fido2.verifyAttestationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin,
      expectedRPID
    });
    const { verified, authenticatorInfo } = verification;
    if (!verified) {
      throw new Error("User verification failed");
    }
    const { base64PublicKey, base64CredentialID, counter } = authenticatorInfo;
    const user = findUserByUsername(username);
    const existingCred = user.credentials.find(
      cred => cred.credID === base64CredentialID
    );
    if (!existingCred) {
      // Add the returned device to the user's list of devices
      user.credentials.push({
        publicKey: base64PublicKey,
        credId: base64CredentialID,
        prevCounter: counter,
        name: name,
        transports: transports
      });
    }

    updateUser(username, user);

    delete req.session.challenge;

    // Respond with user info
    res.json(user);
  } catch (e) {
    delete req.session.challenge;
    res.status(400).send({ error: e.message });
  }
});

/**
 * Respond with the information that's required to call navigator.credential.create()
 * Input is passed via `req.body` with similar format as output
 * Output format:
 * ```{
     rp: {
       id: String,
       name: String
     },
     user: {
       displayName: String,
       id: String,
       name: String
     },
     publicKeyCredParams: [{  // @herrjemand
       type: 'public-key', alg: -7
     }],
     timeout: Number,
     challenge: String,
     excludeCredentials: [{
       id: String,
       type: 'public-key',
       transports: [('ble'|'nfc'|'usb'|'internal'), ...]
     }, ...],
     authenticatorSelection: {
       authenticatorAttachment: ('platform'|'cross-platform'),
       requireResidentKey: Boolean,
       userVerification: ('required'|'preferred'|'discouraged')
     },
     attestation: ('none'|'indirect'|'direct')
 * }```
 **/
router.post("/registerRequest", csrfCheck, sessionCheck, async (req, res) => {
  const username = req.session.username;
  const user = findUserByUsername(username);
  try {
    const excludeCredentials = [];
    if (user.credentials.length > 0) {
      for (let cred of user.credentials) {
        excludeCredentials.push({
          id: cred.credId,
          type: "public-key",
          transports: cred.transports
        });
      }
    }
    const pubKeyCredParams = [];
    // const params = [-7, -35, -36, -257, -258, -259, -37, -38, -39, -8];
    const params = [-7, -257];
    for (let param of params) {
      pubKeyCredParams.push({ type: "public-key", alg: param });
    }
    const as = {}; // authenticatorSelection
    const aa = req.body.authenticatorSelection.authenticatorAttachment;
    const rr = req.body.authenticatorSelection.requireResidentKey;
    const uv = req.body.authenticatorSelection.userVerification;
    const cp = req.body.attestation; // attestationConveyancePreference
    let asFlag = false;
    let authenticatorSelection;
    let attestation = "none";

    if (aa && (aa == "platform" || aa == "cross-platform")) {
      asFlag = true;
      as.authenticatorAttachment = aa;
    }
    if (rr && typeof rr == "boolean") {
      asFlag = true;
      as.requireResidentKey = rr;
    }
    if (uv && (uv == "required" || uv == "preferred" || uv == "discouraged")) {
      asFlag = true;
      as.userVerification = uv;
    }
    if (asFlag) {
      authenticatorSelection = as;
    }
    if (cp && (cp == "none" || cp == "indirect" || cp == "direct")) {
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
      authenticatorSelection
    });

    req.session.challenge = options.challenge;

    // Temporary hack until SimpleWebAuthn supports `pubKeyCredParams`
    options.pubKeyCredParams = [];
    for (let param of params) {
      options.pubKeyCredParams.push({ type: "public-key", alg: param });
    }
    res.status(200).json(options);
  } catch (e) {
    res.status(400).send({ error: e });
  }
});

module.exports = router;
