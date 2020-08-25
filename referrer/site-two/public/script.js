function formatReferrer(referrer, policyId) {
  return referrer.replace(
    /stuff\/detail\?tag=red&p=p[0-2]{1}/g,
    `<span class="nok">stuff/detail?tag=red&p=${policyId}</span>`
  )
}

const documentReferrerEl = document.getElementById('documentReferrer')
documentReferrerEl.innerText = document.referrer
const headerReferrerEl = document.getElementById('headerReferrer')
const els = [documentReferrerEl, headerReferrerEl]

els.forEach((el) => {
  const referrer = el.innerText
  const params = new URL(referrer).searchParams
  const policyId = params.get('p')
  const formattedReferrer = formatReferrer(referrer, policyId)
  el.innerHTML = formattedReferrer
})

const isInIframe = parent !== window
console.log('isInIframe: ', isInIframe)
