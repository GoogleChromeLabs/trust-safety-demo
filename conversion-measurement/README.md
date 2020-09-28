# 🧮 Click-through conversion measurement event-Level API: demo

## Live demo

[Live demo](https://goo.gle/sppi-devrel-eventlevel)

## Set and run locally

### Browser setup

The deployed version of the demo uses origin trials, so that conversion measurement is automatically enabled for the origins of the deployed demo sites.
But when running the demo **locally**, the origin trial tokens won't be valid. You'll need to configure your browser to support conversion measurement instead.

So, if you're running the demo locally (`localhost` or `127.0.0.1`):

- Go to flags by typing `chrome://flags` in Chrome's URL bar. Turn on the two flags `#enable-experimental-web-platform-features` and `#conversion-measurement-api`.
- **Disable** third-party cookie **blocking**. In the long term, dedicated browser settings will be available to allow/block the API. Until then, third-party cookie blocking is used as the signal that users don't want to share data about their conversions—and hence that this API should be disabled.

## Set and run

- Run `sh ./init.sh`
- Run `sh ./start.sh` -> You should have 4 servers runnning: home, publisher, advertiser, adtech server.
- Open `127.0.0.1:8082` in Chrome Canary.
- Follow the instructions in the UI.

## ⚠️ Gotcha

In local development, use and open `127.0.0.1` URLs, not `localhost`. Because conversions and reporting are origin-dependent and this code uses `127.0.0.1` (see `.env` files).

## About the API

[API explainer](https://github.com/WICG/conversion-measurement-api)

## Questions or issues?

Ping [@ChromiumDev](https://twitter.com/ChromiumDev) or [@maudnals](https://twitter.com/maudnals) on Twitter.
