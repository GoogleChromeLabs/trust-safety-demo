# ⚡️ Click-through conversion measurement event-Level API: demo

## Live demo

[Live demo](https://goo.gle/sppi-devrel-eventlevel)

## Set and run locally

### Browser setup

Conversion measurement is automatically enabled for the origins of the deployed demo sites, via origin trial tokens.
But when running the demo **locally**, the origin trial tokens won't be valid. You'll need to configure your browser to support conversion measurement instead.

So, if you're running the demo locally (`127.0.0.1`):

- Go to flags by typing `chrome://flags` in Chrome's URL bar. Turn on the **two** flags `#enable-experimental-web-platform-features` and `#conversion-measurement-api`.
- **Disable** third-party cookie **blocking**. In the long term, dedicated browser settings will be available to allow/block the API. Until then, third-party cookie blocking is used as the signal that users don't want to share data about their conversions—and hence that this API should be disabled.

Whether or not the demo is running locally, you need Chrome version **86** or later (for example [Chrome Canary](https://www.google.com/chrome/canary/).
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

Ping [@ChromiumDev](https://twitter.com/ChromiumDev) or [@maudnals](https://twitter.com/maudnals) on Twitter.
