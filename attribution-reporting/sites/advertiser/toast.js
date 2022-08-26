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

if (document.featurePolicy.allowsFeature('attribution-reporting')) {
  Toastify({
    text: `💡 Demo tip: \n\n The conversion pixel makes a request to the adtech endpoint. \n The adtech endpoint then instructs the browser to trigger an attribution. \n If the browser finds a source event that matches this trigger, it generates an attribution report. \n\n You can see the report in chrome://attribution-internals.\n`,
    duration: -1, // infinity
    close: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true, // Prevents dismissing of toast on hover
    offset: {
      y: 500,
      x: 40
    },
    style: {
      background: '#000000d6',
      cursor: 'pointer',
      fontFamily: "'Lucida Console', Monaco, monospace",
      fontSize: '.8rem',
      boxShadow:
        'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;',
      borderRadius: '6px',
      width: '40vw',
      maxWidth: '40rem'
    }
  }).showToast()
}
