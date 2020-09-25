# Referrer demo

- Go to https://site-one-dot-referrer-demo-280711.ey.r.appspot.com/stuff/detail?tag=red&p=p0
- **To test document-level policy**:
  - Select a policy in the button bar.
  - Note that the policy is set as a URL parameter. `p=p0` (default), `p1` (no-referrer-when-downgrade), `p2` (strict-origin-when-cross-origin), `p3` (strict-origin-when-cross-origin)
- **To test element-level `referrerpolicy`:**
  - Check the last sections "Let's test element-based referrerpolicy" 
  - `FULL` = the full URL was shared in the `Referer`, `ORIGIN` = only the origin, `EMPTY` = no `Referer`.
 - **To test request-level `referrerPolicy`:**
  - Follow the on-screen indications.
