const express = require("express");
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const app = express();

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', './views');
app.use(express.static("public"));
app.use(express.json({type: "application/reports+json"}));

// const reporting_endpoint = 'https://742ee3e6f7d80ca065e6cc05f16b6947.report-uri.com/a/d/g';
// const reporting_endpoint = `https://${process.env.PROJECT_DOMAIN}.glitch.me/report`;
const reporting_endpoint = `https://reporting-endpoint.glitch.me/post`;

app.use((req, res, next) => {
  res.set('Origin-Trial', `${process.env.OT_TOKEN}`);

  if (req.query.coep  && ['require-corp'].includes(req.query.coep)) {
    const reportTo = {
      group: 'coep',
      max_age: 60*60*24,
      endpoints: [{
        url: reporting_endpoint
      }],
      "include_subdomains":true
    };
    const previousReportTo = res.get('Report-To');
    const parsedReporTo = JSON.stringify(reportTo);
    const newReportTo = previousReportTo ? `${previousReportTo},${parsedReporTo}` : parsedReporTo;
    res.set('Report-To', newReportTo);
    if ('report-only' in req.query) {
      res.set('Cross-Origin-Embedder-Policy-Report-Only', `${req.query.coep};report-to="coep"`);
    } else {
      res.set('Cross-Origin-Embedder-Policy', `${req.query.coep};report-to="coep"`);
    }
  }
  if (req.query.corp && ['same-origin', 'same-site', 'cross-origin'].includes(req.query.corp)) {
    res.set('Cross-Origin-Resource-Policy', req.query.corp);
  }
  if (req.query.coop &&
      ['same-origin', 'same-origin-allow-popups', 'unsafe-none'].includes(req.query.coop)) {
    const reportTo = {
      group: 'coop',
      max_age: 60*60*24,
      endpoints: [{
        url: reporting_endpoint
      }]
    };
    const previousReportTo = res.get('Report-To');
    const parsedReporTo = JSON.stringify(reportTo);
    const newReportTo = previousReportTo ? `${previousReportTo},${parsedReporTo}` : parsedReporTo;
    res.set('Report-To', newReportTo);
    if ('report-only' in req.query) {
      res.set('Cross-Origin-Opener-Policy-Report-Only', `${req.query.coop};report-to="coop"`);
    } else {
      res.set('Cross-Origin-Opener-Policy', `${req.query.coop};report-to="coop"`);      
    }
  }
  if (req.query.xfo &&
      ['deny', 'sameorigin'].includes(req.query.xfo)) {
    res.set('X-Frame-Options', req.query.xfo);
  }
  next();  
});

app.get("/check.svg", (req, res) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>');
});

app.post('/report', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.cookie('test', 'abc', { sameSite: 'None', secure: true });
  res.render("index.html", {
    origin_trial: process.env.OT_TOKEN
  });
});

app.get("/iframe", (req, res) => {
  res.cookie('test', 'abc', { sameSite: 'None', secure: true });
  res.render("iframe.html", {
    origin_trial: process.env.OT_TOKEN
  });
});

app.get("/popup", (req, res) => {
  res.cookie('test', 'abc', { sameSite: 'None', secure: true });
  res.render("popup.html", {
    origin_trial: process.env.OT_TOKEN
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
