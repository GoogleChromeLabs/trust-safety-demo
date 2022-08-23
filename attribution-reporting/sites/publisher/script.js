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

const banner = document.getElementById('notSupportedBanner')
const menuWrapper = document.getElementById('menuWrapper')

if (!document.featurePolicy.allowsFeature('attribution-reporting')) {
  menuWrapper.style.display = 'none'
  if (banner.style.display === 'none') {
    banner.style.display = 'block'
  } else {
    banner.style.display = 'none'
  }
} else {
  menuWrapper.style.display = 'block'
}

// Highlight current menu item
let current = 0
for (var i = 0; i < document.links.length; i++) {
  if (document.links[i].href === document.URL) {
    current = i
  }
}
document.links[current].className = 'current'

document.onreadystatechange = function() {
  if (document.querySelector(".loading")) {
    if (document.readyState !== "complete") {
      document.querySelector(".loading").style.visibility = "visible";
    } else {
      document.querySelector(".loading").style.display = "none";
    }
  }
};