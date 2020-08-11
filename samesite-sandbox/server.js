const express = require("express");
const cp = require("cookie-parser");
const app = express();

app.use(cp());

app.enable('trust proxy');
app.use(function (req, res, next) {
  if (req.secure) {
    res.set('Strict-Transport-Security', 'max-age=63072000; inlcudeSubdomains; preload');
    return next();
  }
  
  res.redirect(301, 'https://' + req.headers.host + req.url);
});

app.get("/", function(request, response) {
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("set-cookie", "ck03=vl03; SameSite=InvalidValue");
  response.cookie("ck00", "vl00");
  response.cookie("ck01", "vl01", { sameSite: "none", secure: true });
  response.cookie("ck02", "vl02", { sameSite: "none" });
  response.cookie("ck04", "vl04", { sameSite: "lax" });
  response.cookie("ck05", "vl05", { sameSite: "strict" });

  response.sendFile(__dirname + "/public/index.html");
});

app.all("/cookies.json", function(request, response) {
  response.set(
    "Access-Control-Allow-Origin",
    "https://googlechromelabs.github.io"
  );
  response.set("Access-Control-Allow-Credentials", "true");
  response.json(request.cookies);
});

app.use(express.static('public', { maxAge: '1d' } ));

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
