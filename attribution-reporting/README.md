# Attribution Reporting API: demo

## >> [Live demo](https://goo.gle/attribution-reporting-demo)

## Set up and run locally

### Set up (one time only)
1. If it's not yet installed on your machine, install [node.js](https://nodejs.org/en/download/). 
2. Install the latest Firebase CLI by running the following in your terminal: `npm install -g firebase-tools`. The version known to work with this README.md is 13.3.0.
3. In your terminal, run `git clone https://github.com/GoogleChromeLabs/trust-safety-demo.git && cd trust-safety-demo/attribution-reporting`. This command will create a folder, clone all of the `trust-safety` demo code in that folder, and navigate you to the `attribution-reporting` demo subfolder.
4. In your terminal, run `cd functions && npm install && cd ..`. This command will install all the required dependencies for you to locally run the `attribution-reporting` demo.

### Run locally
1. Optionally, pull the latest code from this repository: in your terminal, navigate to `trust-safety-demo/attribution-reporting` and run the `git pull` command.
2. Locally start the demo: in your terminal, navigate to `trust-safety-demo/attribution-reporting` and run `firebase emulators:start`. If you have no Firebase project setup you can add `--project none` (`firebase emulators:start --project none`).
    * You should now have multiple servers running: home(:8080), adtech(:8085), advertiser(:8086), publisher(:8087) server.
    * Make sure you see the following output and port mappings in your terminal. If the port mappings differ, see the [#Troubleshooting](#troubleshooting) section.

    ```sh
    ...
    i  hosting[arapi-home]: Serving hosting files from: sites/home
    ✔  hosting[arapi-home]: Local server: http://localhost:8080
    i  hosting[arapi-adtech]: Serving hosting files from: sites/adtech
    ✔  hosting[arapi-adtech]: Local server: http://localhost:8085
    i  hosting[arapi-advertiser]: Serving hosting files from: sites/advertiser
    ✔  hosting[arapi-advertiser]: Local server: http://localhost:8086
    i  hosting[arapi-publisher]: Serving hosting files from: sites/publisher
    ✔  hosting[arapi-publisher]: Local server: http://localhost:8087
    ...
    ```

4. Open [arapi-home.localhost:8080](http://arapi-home.localhost:8080) in Chrome.
5. Follow the instructions in the UI. 🚨 In particular, make sure to follow the **Set up your browser** instructions.

## Fork and customize

All URLs in this demo (publisher, advertiser, adtech) can be customized.
Look for `functions/.env.local` and `functions/.env.prod` files and customize them as needed.

## Troubleshooting

If you see different port mapping during running the local emulators with `firebase emulators:start`, the reason might be that the ports are bound to a different process.

Make sure all processes using ports `8080,8085,8086,8087` are closed. To find out information about processes that occupy the ports you can do the following.

```sh
# find the process id of the process holding a port
lsof -ti:<port_number>

# find the process name and info
ps | grep $(lsof -ti:8085)

# stop a process that is holding a port
kill $(lsof -ti:8085)
```

## Questions or issues?

Join the [developer mailing list](https://groups.google.com/u/1/a/chromium.org/g/attribution-reporting-api-dev) and ask your question there.
