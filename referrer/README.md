# Referrer demo

Go to https://site-one-dot-referrer-demo-280711.ey.r.appspot.com/stuff/detail?tag=red&p=p0.
`site-one` is the main site, from which requests are made. `site-two` is used as the cross-origin host for various resources. `site-three` and `site-four` are only used to test request-level `referrerPolicy` that would be made by a third-party script.

## To test document-level policy
- Select a policy in the button bar. See in the table below and in the iframe how the sent `Referer` is affected.
- Note that the policy is set as a URL parameter:
  - `p=p0` // browser default (no document-leve policy)
  - `p=p1` // `no-referrer-when-downgrade`
  - `p=p2` // `strict-origin-when-cross-origin`
  - `p=p3` // `no-referrer`
  
## To test element-level `referrerpolicy`
- Check the section "Let's test element-level referrerpolicy" (bottom of the page)
- For images and scripts: clcik the link, the `Referer` will be displayed on the navigation destination page (`site-two`).
- For images and scripts: `FULL` means the full URL was shared in the `Referer`, `ORIGIN` only the origin, `EMPTY` means no `Referer`.
  
## To test request-level `referrerPolicy`
- Check the section "Let's test fetch-level referrerPolicy" (bottom of the page)
- Follow the indications in the UI.
   
   
