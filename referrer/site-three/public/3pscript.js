const crossUrl =
  'https://site-four-dot-referrer-demo-280711.ey.r.appspot.com/fetchtest'

const policies = [
  '',
  'no-referrer-when-downgrade',
  'strict-origin-when-cross-origin'
]

policies.forEach(async (policy) => {
  const unique = new Date().getTime() + Math.random() * 100
  const referrerResponse = await fetch(`${crossUrl}?dummy=${unique}`, {
    referrerPolicy: policy
  })
  const referrer = (await referrerResponse.text()) || 'empty (no referrer)'
  const el = document.createElement('div')
  const referrerPolicyFormatted = policy
    ? `referrerPolicy = ${policy}:`
    : `No referrerPolicy:`
  el.innerHTML = `<p><div>${referrerPolicyFormatted}<div><div class="url">${referrer}<div></p>`
  document.getElementById('script-referrer-wrapper').appendChild(el)
})
