/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const MIN_SUPPORTED_BROWSER_VERSION = 105
const SUPPORTED_USER_AGENTS = ['Google Chrome']
// , 'Chromium'

displayBrowserVersionRequirements()
displayWarningBannerIfSetupIncorrect()

function checkIsBrowserSupported() {
  const supportedAgentsByThisUser = navigator.userAgentData.brands.filter(
    (item) => SUPPORTED_USER_AGENTS.includes(item.brand)
  )
  if (supportedAgentsByThisUser.length === 0) {
    return false
  } else {
    const browserVersion = Number.parseFloat(
      supportedAgentsByThisUser[0].version
    )
    if (browserVersion < MIN_SUPPORTED_BROWSER_VERSION) {
      return false
    }
    return true
  }
}

function getBrowserSetupStatus() {
  const status = {
    isBrowserSetupCorrect: true,
    issues: []
  }
  const isBrowserVersionSupported = checkIsBrowserSupported()
  const isFeatureAllowed = document.featurePolicy.allowsFeature(
    'attribution-reporting'
  )
  if (!isBrowserVersionSupported || !isFeatureAllowed) {
    status.isBrowserSetupCorrect = false
  }
  if (!isBrowserVersionSupported) {
    status.issues.push(
      `Your browser is not supported by this demo. Use ${SUPPORTED_USER_AGENTS.join(
        ' or '
      )}, version ${MIN_SUPPORTED_BROWSER_VERSION} or newer.`
    )
  }
  if (!isFeatureAllowed) {
    status.issues.push(
      'The Attribution Reporting API is not enabled on this page.'
    )
  }
  return status
}

function displayBrowserVersionRequirements() {
  // Display browser version requirements in the demo home page
  const browserVersionRequirementsEl = document.getElementById(
    'browserVersionRequirementsEl'
  )
  if (browserVersionRequirementsEl) {
    browserVersionRequirementsEl.innerText = `Use ${SUPPORTED_USER_AGENTS.join(
      ' or '
    )}, version ${MIN_SUPPORTED_BROWSER_VERSION} or newer.`
  }
}

function displayWarningBannerIfSetupIncorrect() {
  // Check browser setup and display banner if needed
  const { isBrowserSetupCorrect, issues } = getBrowserSetupStatus()

  if (!isBrowserSetupCorrect) {
    const banner = document.getElementById('notSupportedBanner')
    if (banner.style.display === 'none') {
      banner.style.display = 'block'
      banner.innerHTML += `Your setup seems incorrect.<br>`
      banner.innerHTML += `${issues.length} issue(s):`
      banner.innerHTML += issues.map((e) => `<li>${e}</li>`).join('')
      banner.innerHTML += '</ul>'
    } else {
      banner.style.display = 'none'
    }
  }
}
