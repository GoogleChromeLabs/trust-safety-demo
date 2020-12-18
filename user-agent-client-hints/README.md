# User-Agent 👀 Client Hints

User-Agent Client Hints is a new expansion to the Client Hints API, that enables
developers to access information about a user's browser in a privacy-preserving
and ergonomic way. Client Hints enable developers to actively request
information about the user's device or conditions, rather than needing to parse
it out of the User-Agent (UA) string. Providing this alternative route is the
first step to eventually reducing User-Agent string granularity.

Learn how to update your existing functionality that relies on parsing the
User-Agent string to make use of User-Agent Client Hints instead.

📖 Read the article on <https://web.dev/user-agent-client-hints>

🐦 Ping <https://twitter.com/rowan_m> with questions.

## Viewing the demo

🎏 You can see a running version on Glitch
<https://user-agent-client-hints.glitch.me/>

\*️⃣ Requires Chrome 84 Beta or equivalent.

🚩 Enable the `chrome://flags/#enable-experimental-web-platform-features` flag

## Running the demo locally

Before the initial run, you will need to download the dependencies from from
[npm](https://docs.npmjs.com/). In this directory, run:

```
npm ci
```

Start the server using:

```
npm start
```

The server will run on a random port which will be shown in the console.

If you're developing, then there is a task to start the server in development
mode on port 8080.

```
npm run start:dev
```
