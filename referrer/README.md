# Referrer demo

- `site-one` is the main site, from which requests are made.
- `site-two` is used as the cross-origin host for various resources.
- `site-three` and `site-four` are only used to test request-level `referrerPolicy` made by a third-party script.

## Setting up the demo locally

Sorry, these steps are manual, just would need to add an `.env` file. Meanwhile:

- Look for instances of site-one in the code
- Run local-dev.sh

## Using the demo

Navigate to https://site-one-dot-referrer-demo-280711.ey.r.appspot.com/stuff/detail?tag=red&p=p0 or localhost:<port>/stuff/detail?tag=red&p=p0 if you're testing locally.

### To test document-level policy

- Select a policy in the button bar. See in the table below and in the iframe how the sent `Referer` is affected.
- Note that the policy is set as a URL parameter:
  - `p=p0` // browser default (no document-level policy)
  - `p=p1` // `no-referrer-when-downgrade`
  - `p=p2` // `strict-origin-when-cross-origin`
  - `p=p3` // `no-referrer`

### To test element-level `referrerpolicy`

- Check the section "Let's test element-level referrerpolicy" (bottom of the page).
- For navigations: click the link, the `Referer` will be displayed on the navigation destination page (`site-two`).
- For images: `FULL` means the full URL was shared in the `Referer`, `ORIGIN` only the origin, `EMPTY` means no `Referer`.
  **ℹ️ Note:** to make sure all requests are made even though the images could be cached, a timestamp + random number is added to each image's `src` (look for `dummy=...` is the source code).
- For scripts: the `Referer` that was sent is displayed in the UI. See the code in `site-two/server.js`.

### To test request-level `referrerPolicy`

- Check the section "Let's test fetch-level referrerPolicy" (bottom of the page).
- The `Referer` that was sent is displayed in the UI. See the code in `site-three/public/3pscript.js`.
