# Attribution Reporting API: demo

## See the live demo

## >> [Live demo](https://goo.gle/attribution-reporting-demo)

## Set and run locally

1. Run `git clone https://github.com/GoogleChromeLabs/trust-safety-demo.git && cd trust-safety-demo/conversion-measurement`
1. Make sure you have [node.js](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) installed.
1. Run `sh ./init.sh` to download and install all dependencies.
1. Run `sh ./start.sh` to startup several local node apps.
1. You now have multiple servers running: home(:8080), publisher(:8081), advertiser(:8082), adtech(:3000) server.
1. Open [localhost:8080](http://localhost:8080) in Chrome.
1. Follow the instructions in the UI. 🚨 In particular, make sure to follow the **Set up your browser** instructions.

## Fork and customize

All URLs in this demo (publisher, advertiser, adtech) can be customized.
Look for `.env.development` and `.env.production` files in each subfolder and customize them as needed.

## Questions or issues?

Join the [developer mailing list](https://groups.google.com/u/1/a/chromium.org/g/attribution-reporting-api-dev) and ask your question there.
