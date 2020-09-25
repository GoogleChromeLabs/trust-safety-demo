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

/* -------------------------------------------------------------------------- */
/*                          DOM elements and mapping                          */
/* -------------------------------------------------------------------------- */

const image = document.getElementById('img')
const head = document.getElementById('head')
const policyEl = document.getElementById('detected-policy')
const buttonEls = document.querySelectorAll('button')
const requestTypeXEl = document.getElementById('cross-origin-no-downgrade')
const requestTypeSameEl = document.getElementById('same-origin')
const iframeWrapperEl = document.getElementById('iframe-wrapper')
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
  createIframe()
  triggerLoadImages()
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

function createIframe() {
  const newIframe = document.createElement('iframe')
  newIframe.id = 'iframe'
  newIframe.src = crossOriginHttpsUrlIframe
  newIframe.height = 150
  const oldIframe = document.getElementById('iframe')
  if (oldIframe) {
    iframeWrapperEl.replaceChild(newIframe, oldIframe)
  } else {
    iframeWrapperEl.appendChild(newIframe)
  }
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

function displayPolicy(policy) {
  policyEl.innerHTML = policy
}

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

function displayReferrer(url, referrer, policyId) {
  let pathHighlightCssClass = 'ok'
  if (url === crossOriginHttpsUrl) {
    pathHighlightCssClass = 'nok'
  }
  const formattedReferrer = referrer.replace(
    /stuff\/detail\?tag=red&p=p[0-2]{1}/g,
    `<span class="${pathHighlightCssClass}">stuff/detail?tag=red&p=${policyId}</span>`
  )
  elementsByUrlMap[url].innerHTML = formattedReferrer
}
