# ⚡️ Event Conversion Measurement API: demo

## Live demo

[Live demo](https://goo.gle/sppi-devrel-eventlevel)

## Fork and customize

All URLs in this demo (publisher, advertiser, adtech) can be customized.
Look for `.env.development` and `env.production` files in each subfolder and customize them as needed.

## Set and run locally

### Browser setup

Go to flags by typing `chrome://flags` in Chrome's URL bar. Turn on the flag `#enable-experimental-web-platform-features`.

Run Chrome version **86** or later (for example [Chrome Beta](https://www.google.com/chrome/beta/).
You can check what version of Chrome you're using by typing `chrome://version` in the URL bar.

### (Optional) Other useful debugging features

You can see the conversion reports the browser has scheduled to send at `chrome://conversion-internals/` > **Pending Reports**.
Reports are sent at scheduled times. But for debugging purposes, you may not want to wait for these scheduled times.
To do so, you can:

- Click **Send All Reports** in `chrome://conversion-internals/` > **Pending Reports**.
- Or activate the flag `chrome://flags/#conversion-measurement-debug-mode`, so that all reports are always sent **immediately**.

## Setup and run

- Run `sh ./init.sh`
- Run `sh ./start.sh` -> You should have 4 servers runnning: home, publisher, advertiser, adtech server.
- Open `127.0.0.1:8080` in Chrome Canary.
- Follow the instructions in the UI.

## ⚠️ Gotcha

In local development, use and open `127.0.0.1` URLs, not `localhost`. Because conversions and reporting are origin-dependent and this code uses `127.0.0.1` (see `.env` files).

## About the API

[API explainer](https://github.com/WICG/conversion-measurement-api)

## Questions or issues?

Ping [@maudnals](https://twitter.com/maudnals) or [@ChromiumDev](https://twitter.com/ChromiumDev) on Twitter.
