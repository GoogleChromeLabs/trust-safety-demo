# Attribution Reporting API: demo

## See the live demo

## >> [Live demo](https://goo.gle/sppi-devrel-eventlevel)

## Setup and run locally

1. Run `git clone https://github.com/GoogleChromeLabs/trust-safety-demo.git && cd trust-safety-demo/conversion-measurement`
2. Run `sh ./init.sh`
3. Run `sh ./start.sh`.
4. You should now have multiple servers running: home, publisher, other publisher, advertiser, adtech server.
5. Open `localhost:8080` in Chrome Canary.
6. Follow the instructions in the UI. 🚨 In particular, make sure to follow the **Set up your browser** instructions and check out the screencast.

## Customize

All URLs in this demo (publisher, advertiser, adtech) can be customized: look for `.env.development` and `env.production` files in each subfolder and customize them as needed.
