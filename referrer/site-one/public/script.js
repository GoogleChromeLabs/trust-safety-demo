/* -------------------------------------------------------------------------- */
/*                                Request URLs                                */
/* -------------------------------------------------------------------------- */

const siteTwo = 'https://site-two-dot-referrer-demo-280711.ey.r.appspot.com'
const crossOriginHttpsUrl = `${siteTwo}/ref`
const crossOriginHttpsUrlIframe = `${siteTwo}/ifr`
const crossOriginHttpsUrlImage = `${siteTwo}/mars.jpg`
const crossOriginHttpsUrlOtherImage = `${siteTwo}/cross-o-img`
const sameOriginUrl = '/ref'
const urlsToFetch = [crossOriginHttpsUrl, sameOriginUrl]
const urlToFetch = [crossOriginHttpsUrl]

/* -------------------------------------------------------------------------- */
/*                                  Policies                                  */
/* -------------------------------------------------------------------------- */

const nrwd = 'no-referrer-when-downgrade'
const sowco = 'strict-origin-when-cross-origin'
const nr = 'no-referrer'
const policyIdToName = {
  p0: null,
  p1: nrwd,
  p2: sowco,
  p3: nr
}
const allPoliciesForElements = ['', nrwd, sowco, nr]

/* -------------------------------------------------------------------------- */
/*                          DOM elements and mapping                          */
/* -------------------------------------------------------------------------- */

const head = document.getElementById('head')
const policyEl = document.getElementById('detected-policy')
const buttonEls = document.querySelectorAll('button')
const requestTypeXEl = document.getElementById('cross-origin-no-downgrade')
const requestTypeSameEl = document.getElementById('same-origin')
const elementsByUrlMap = {
  [crossOriginHttpsUrl]: requestTypeXEl,
  [sameOriginUrl]: requestTypeSameEl
}

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */

main()

function main() {
  // infer the default policy and display it (once only)
  fetch(crossOriginHttpsUrl)
    .then((referrer) => referrer.text())
    .then((referrer) => {
      const policy = inferChromeDefaultPolicy(referrer)
      displayPolicy(policy)
    })

  const params = new URL(document.location).searchParams
  const policyId = params.get('p')
  const policyName = policyIdToName[policyId]
  styleButtons(policyId)

  if (policyName) {
    const newReferrerPolicyMeta = document.createElement('meta')
    newReferrerPolicyMeta.setAttribute('name', 'referrer')
    newReferrerPolicyMeta.setAttribute('content', policyName)
    newReferrerPolicyMeta.setAttribute('id', 'referrer-policy-meta')
    head.appendChild(newReferrerPolicyMeta)
  }

  getAndDisplayAllFetchReferrers(policyId)
  createIframes()
  triggerLoadImages()
  createScripts()
}

/* -------------------------------------------------------------------------- */
/*                               Images + Iframe                              */
/* -------------------------------------------------------------------------- */

function triggerLoadImages() {
  const imagesToLoad = document.querySelectorAll('.img')
  imagesToLoad.forEach((image) => {
    // new date and time: hack to re-trigger the request
    image.src = `${crossOriginHttpsUrlOtherImage}?dummy=${
      new Date().getTime() + Math.random() * 100
    }`
  })
}

function createIframes() {
  allPoliciesForElements.forEach((policy) => {
    const newIframe = document.createElement('iframe')
    newIframe.src = `${crossOriginHttpsUrlIframe}?dummy=${
      new Date().getTime() + Math.random() * 100
    }`
    newIframe.height = 150
    if (policy) {
      newIframe.referrerPolicy = policy
    }
    const wrapper = document.getElementById(
      'iframes-with-referrerpolicy-wrapper'
    )
    const title = document.createElement('div')
    title.innerText = policy
      ? `referrerpolicy = ${policy}`
      : 'No referrerpolicy'
    wrapper.appendChild(title)
    wrapper.appendChild(newIframe)
  })
}

function createScripts() {
  allPoliciesForElements.forEach((policy, idx) => {
    const elIdToDisplayReferrer = `el${idx}`
    const newScript = document.createElement('script')
    newScript.src = `https://site-two-dot-referrer-demo-280711.ey.r.appspot.com/cross-o-script?elId=${elIdToDisplayReferrer}&dummy=${
      new Date().getTime() + Math.random() * 100
    }`
    if (policy) {
      newScript.referrerPolicy = policy
    }
    const wrapper = document.getElementById(
      'scripts-with-referrerpolicy-wrapper'
    )
    const title = document.createElement('div')
    title.innerText = policy
      ? `referrerpolicy = ${policy}`
      : 'No referrerpolicy'
    const referrerEl = document.createElement('div')
    referrerEl.id = elIdToDisplayReferrer
    referrerEl.classList = 'url'
    const p = document.createElement('p')

    wrapper.appendChild(p)
    p.appendChild(title)
    p.appendChild(referrerEl)
    p.appendChild(newScript)
  })
}

/* -------------------------------------------------------------------------- */
/*                               Referrer utils                               */
/* -------------------------------------------------------------------------- */

function inferChromeDefaultPolicy(referrer) {
  const origin = window.location.origin
  const fullUrl = window.location.href
  if (referrer === origin || referrer === `${origin}/`) {
    return sowco
  } else if (referrer === fullUrl) {
    return nrwd
  }
  return '?'
}

function switchPolicy(event) {
  const selectedButton = event.currentTarget
  displayAsLoading()
  const policyId = selectedButton.value
  const searchParams = new URLSearchParams(window.location.search)
  if (policyId) {
    searchParams.set('p', policyId)
  } else {
    searchParams.delete('p')
  }
  window.location.search = searchParams.toString()
}

async function getAndDisplayAllFetchReferrers(policyId) {
  urlsToFetch.forEach(async (url) => {
    const referrerResponse = await fetch(url)
    const referrer = await referrerResponse.text()
    displayReferrer(url, referrer, policyId)
  })
}

/* -------------------------------------------------------------------------- */
/*                         Side effects / DOM display                         */
/* -------------------------------------------------------------------------- */

function styleButtons(policyId) {
  buttonEls.forEach((btn) => (btn.className = ''))
  // [...] to transform the NodeList into a map
  const buttonToSelect = [...buttonEls].find((btn) => btn.value === policyId)
  buttonToSelect.className = 'selected'
}

function displayAsLoading() {
  Object.values(elementsByUrlMap).forEach((el) => {
    el.innerHTML = '...'
  })
}

function displayPolicy(policy) {
  policyEl.innerHTML = policy
}

function displayReferrer(url, referrer, policyId) {
  let pathHighlightCssClass = 'ok'
  if (url === crossOriginHttpsUrl) {
    pathHighlightCssClass = 'nok'
  }
  const formattedReferrer = referrer
    ? referrer.replace(
        /stuff\/detail\?tag=red&p=p[0-2]{1}/g,
        `<span class="${pathHighlightCssClass}">stuff/detail?tag=red&p=${policyId}</span>`
      )
    : 'empty (no referrer)'
  elementsByUrlMap[url].innerHTML = formattedReferrer
}
