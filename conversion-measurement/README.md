# Attribution Reporting API: demo

## >> [Live demo](https://goo.gle/attribution-reporting-demo)

## Set and run locally

1. Run `git clone https://github.com/GoogleChromeLabs/trust-safety-demo.git && cd trust-safety-demo/conversion-measurement`
1. Make sure you have [node.js](https://nodejs.org/en/download/) and the latest Firebase CLI `npm install -g firebase-tools` installed.
1. Install all dependencies in the functions folder `cd functions && npm install && cd ..`.
1. Run the Firebase emulator with `firebase emulators:start` to startup all the sites. If you have no Firebase project setup you can add `--project none`.
    * Make sure you see the following output and port mappings. If the port mappings differ please see the [#Troubleshooting](#troubleshooting) section.

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

1. You now have multiple servers running: home(:8080), adtech(:8085), advertiser(:8086), publisher(:8087) server.
1. Open [arapi-home.localhost:8080](http://arapi-home.localhost:8080) in Chrome.
1. Follow the instructions in the UI. 🚨 In particular, make sure to follow the **Set up your browser** instructions.

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
