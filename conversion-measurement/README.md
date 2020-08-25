# 📐Click-through conversion measurement event-Level API: demo

## Live demo

[Live demo](https://goo.gle/sppi-devrel-eventlevel)

## About the API

[API explainer](https://github.com/WICG/conversion-measurement-api)

## Questions or issues?

Ping [ChromiumDev](https://twitter.com/ChromiumDev) or [maudnals](https://twitter.com/maudnals) on Twitter.

## Set and run locally

- Run `sh ./init.sh`
- Run `sh ./start.sh` -> You should have 4 servers runnning: `8082` (home), `8080` (publisher), `8081` (advertiser), `3000` (adtech)
- Open Chrome Canary
- In Chrome Canary, enable the flags:
  `#enable-experimental-web-platform-features` and `#conversion-measurement-api`
- In Chrome canary, open 3 windows/tabs:
  - `chrome://conversions-internals`: to see the impressions and conversions the browser stores
  - `127.0.0.1:8080`: the publisher page, wher the add is embedded
  - `127.0.0.1:3000`: the adtech server UI, displaying the reports
- In `127.0.0.1:8080` (publisher), click the ad. This navigates to the advertiser's page. Click "Add to cart" to convert. In the conversion internals, you should see one impression and one conversion report scheduled.

💡More info about the API and these steps is visible in the UI.
