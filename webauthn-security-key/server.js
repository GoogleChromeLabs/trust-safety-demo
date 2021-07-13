/*
 * @license
 * Copyright 2019 Google Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const auth = require("./libs/auth");
const app = express();
const fetch = require("node-fetch");

app.set("view engine", "html");
app.engine("html", hbs.__express);
app.set("views", "./views");
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static("dist"));

app.use(
  session({
    // You should specify a real secret here
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }
  })
);

function isFullySignedIn(req) {
  return req.session.name === "main";
}

app.use((req, res, next) => {
  if (process.env.PROJECT_DOMAIN) {
    process.env.HOSTNAME = `${process.env.PROJECT_DOMAIN}.glitch.me`;
  } else {
    process.env.HOSTNAME = req.headers.host;
  }
  const protocol = /^localhost/.test(process.env.HOSTNAME) ? "http" : "https";
  process.env.ORIGIN = `${protocol}://${process.env.HOSTNAME}`;
  if (
    req.get("x-forwarded-proto") &&
    req.get("x-forwarded-proto").split(",")[0] !== "https"
  ) {
    return res.redirect(301, process.env.ORIGIN);
  }
  req.schema = "https";
  next();
});

app.get("/", async (req, res) => {
  if (isFullySignedIn(req)) {
    // If the user is signed in, redirect to the account page
    res.redirect(307, "/account");
    return;
  }
  // If the user is not signed in, start a new "auth" session
  try {
    const authStartResponse = await fetch(`${process.env.ORIGIN}/auth/start`, {
      method: "POST",
      credentials: "same-origin"
    });
    console.info((await authStartResponse.json()).message);
    // Render the index page
    res.render("index.html");
  } catch (e) {
    console.log(e);
  }
});

app.get("/account", (req, res) => {
  if (!isFullySignedIn(req)) {
    // If user is not fully signed in, redirect to the index page with the login form
    res.redirect(307, "/");
    return;
  }
  res.render("account.html", { username: req.session.username });
});

app.use("/auth", auth);

const port = process.env.GLITCH_DEBUGGER ? null : 8080;
const listener = app.listen(port || process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
