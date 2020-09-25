# Referrer demo

- Go to https://site-one-dot-referrer-demo-280711.ey.r.appspot.com/stuff/detail?tag=red&p=p0
- You can select a document-level policy in the button bar - Note that the policy is set as a request parameter. `p=p0` (default), `p1` (no-referrer-when-downgrade), `p2` (strict-origin-when-cross-origin), `p3` (strict-origin-when-cross-origin)
- **To test `referrerpolicy` on elements:**
  - Check the last sections "Let's test element-based referrerpolicy" 
  - `FULL` = the full URL was shared in the `Referer`, `ORIGIN` = only the origin, `EMPTY` = no `Referer`.
 - **To test `referrerpolicy` on fetch:**
  - Follow the on-screen indications.
