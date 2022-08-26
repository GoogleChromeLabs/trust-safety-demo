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

const MIN_SUPPORTED_BRAND_VERSIONS = {
  'Google Chrome': 105,
  Chromium: 105
}

displayBrowserVersionRequirements()
displayWarningBannerIfSetupIncorrect()

function checkIsBrowserSupported() {
  // `!!` makes the return value a boolean (document.featurePolicy will be undefined in e.g. Firefox)
  return !!navigator.userAgentData?.brands.some(({ brand, version }) => {
    const minVersion = MIN_SUPPORTED_BRAND_VERSIONS[brand]
    return Number.parseFloat(version) >= minVersion
  })
}

function checkIsFeatureAllowed() {
  // `!!` makes the return value a boolean (document.featurePolicy?. will be undefined in e.g. Firefox)
  return !!document.featurePolicy?.allowsFeature('attribution-reporting')
}

function getBrowserSetupStatus() {
  const status = {
    isBrowserSetupCorrect: true,
    issues: []
  }
  const isBrowserVersionSupported = checkIsBrowserSupported()
  const isFeatureAllowed = checkIsFeatureAllowed()
  if (!isBrowserVersionSupported || !isFeatureAllowed) {
    status.isBrowserSetupCorrect = false
  }
  if (!isBrowserVersionSupported) {
    status.issues.push(
      `Your browser is not supported by this demo. ${getBrowserRecommendationDisplayText()}.`
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
    // Prints out e.g. 'Google Chrome version 105 (or newer), or Chromium version 105 (or newer)'
    browserVersionRequirementsEl.innerText = `${getBrowserRecommendationDisplayText()}.`
  }
}

function getBrowserRecommendationDisplayText() {
  // Prints out e.g. 'Google Chrome version 105 (or newer), or Chromium version 105 (or newer)'
  return `Use ${Object.entries(MIN_SUPPORTED_BRAND_VERSIONS)
    .map((entry) => `${entry[0]} version ${entry[1]} (or newer)`)
    .join(', or ')}`
}

function displayWarningBannerIfSetupIncorrect() {
  // Check browser setup and display banner if needed
  const { isBrowserSetupCorrect, issues } = getBrowserSetupStatus()

  if (!isBrowserSetupCorrect) {
    const banner = document.getElementById('setup-issues-banner')
    const list = document.getElementById('setup-issues-list')

    if (banner.style.display === 'none') {
      banner.style.display = 'block'
      list.innerHTML = `Your setup seems incorrect.<br> ${
        issues.length
      } issue(s): <ul> ${issues.map((e) => `<li>${e}</li>`).join('')}</ul>`
    } else {
      banner.style.display = 'none'
    }
  }
}
