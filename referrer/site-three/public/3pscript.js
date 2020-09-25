const crossUrl =
  'https://site-four-dot-referrer-demo-280711.ey.r.appspot.com/fetchtest'

const policies = [
  'no-referrer-when-downgrade',
  'strict-origin-when-cross-origin',
  'no-referrer'
]

policies.forEach((policy) => {
  const unique = new Date().getTime() + Math.random() * 100
  fetch(`${crossUrl}?dummy=${unique}`, {
    referrerPolicy: policy
  })
})
