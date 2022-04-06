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

const express = require('express')
const cookieParser = require('cookie-parser')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.use(express.json())
app.use(cookieParser())

app.set('view engine', 'pug')
const PORT = 8084
const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index')
})

/* -------------------------------------------------------------------------- */
/*                               Debugging setup                              */
/* -------------------------------------------------------------------------- */

app.use(function(req, res, next) {
  // Optional: set a regular measurement 3P cookie
  const legacyMeasurementCookie = req.cookies['measure']
  if (legacyMeasurementCookie === undefined) {
    const cookieValue = Math.floor(Math.random() * 1000000000000000)
    res.set(
      'Set-Cookie',
      `measure=${cookieValue}; SameSite=None; Secure; HttpOnly`
    )
  }

  // Set the Attribution Reporting debug cookie
  const debugCookie = req.cookies['ar_debug']
  if (debugCookie === undefined) {
    res.set('Set-Cookie', 'ar_debug=1; SameSite=None; Secure; HttpOnly')
  }
  next()
})

/* -------------------------------------------------------------------------- */
/*                                 Ad serving                                 */
/* -------------------------------------------------------------------------- */

app.get('/ad-click', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  res.render('ad-click', {
    href,
    attributionsrc: `${adtechUrl}/register-source`
  })
})

app.get('/ad-click-js', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  res.render('ad-click-js', {
    href,
    attributionsrc: `${adtechUrl}/register-source`
  })
})

app.get('/ad-view-img', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  res.render('ad-view-img', {
    attributionsrc: `${adtechUrl}/register-source`
  })
})

app.get('/ad-view-js', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  res.render('ad-view-js', {
    attributionsrc: `${adtechUrl}/register-source`
  })
})

app.get('/ad-script-view-img', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adUrl = `${process.env.ADTECH_URL}/ad-view-img`
  const iframe = `<iframe src='${adUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

app.get('/ad-script-view-js', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adUrl = `${process.env.ADTECH_URL}/ad-view-js`
  const iframe = `<iframe src='${adUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

app.get('/ad-script-click-element', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adClickUrl = `${process.env.ADTECH_URL}/ad-click`
  const iframe = `<iframe src='${adClickUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

app.get('/ad-script-click-js', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adClickNoLinkUrl = `${process.env.ADTECH_URL}/ad-click-js`
  const iframe = `<iframe src='${adClickNoLinkUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

/* -------------------------------------------------------------------------- */
/*                  Source registration (ad click or view)                    */
/* -------------------------------------------------------------------------- */

app.get('/register-source', (req, res) => {
  // Send a response with the header Attribution-Reporting-Register-Source in order to ask the browser to register a source event
  const attributionDestination = process.env.ADVERTISER_URL
    // For demo purposes, sourceEventId is a random ID. In a real system, this ID would be tied to a unique serving-time identifier mapped to any information an adtech provider may need
  const sourceEventId = Math.floor(Math.random() * 1000000000000000)
  const legacyMeasurementCookie = req.cookies['measure']
  res.set(
    'Attribution-Reporting-Register-Source',
    JSON.stringify({
      source_event_id: `${sourceEventId}`,
      destination: attributionDestination,
      // Optional: expiry of 7 days (default is 30)
      expiry: '604800',
      // Optional: set a debug key, and give it the value of the legacy measurement 3P cookie.
      // This is a simple approach for demo purposes. In a real system, you would still make this key a unique ID, but you may map it to additional source-time information that you deem useful for debugging or performance comparison.
      debug_key: legacyMeasurementCookie,
      filter_data: {
        conversion_product_type: ['category_1']
      }
    })
  )
  res.set(
    'Attribution-Reporting-Register-Aggregatable-Source',
    JSON.stringify([{
      // Generates a "0x159" key piece (low order bits of the key) named
      // "campaignCounts"
      id: 'campaignCounts',
      // Campaign 345 (out of 511)
      // 345 to hex is 0x159
      key_piece: '0x159' // User saw ad from campaign 345 (out of 511)
    }])
  )
  res.status(200).send('OK')
})

/* -------------------------------------------------------------------------- */
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */

const CHECKOUT_COMPLETED = 'checkout-completed'
const ADD_TO_CART = 'add-to-cart'
const VISIT_PRODUCT_PAGE = 'visit-product-page'
const SIGNUP_NEWSLETTER = 'signup-newsletter'

const conversionValues = {
  // Trigger data for views (event sources) must be 0 or 1 (1 bit)
  // Trigger data for clicks (event sources) must be a value between 0 and 7 (3 bits)

  // Checkout = 1, so that the value is consistent across clicks and views
  [CHECKOUT_COMPLETED]: 1,
  [ADD_TO_CART]: 2,
  [VISIT_PRODUCT_PAGE]: 3,
  [SIGNUP_NEWSLETTER]: 4
}

function getTriggerData(conversionType) {
  return conversionValues[conversionType]
}

function getPriority(conversionType, usePriorities) {
  if (!usePriorities) {
    // No conversion should be prioritized specifically => always return a priority of 0
    return 0
  } else {
    // Assign a priority of 100 to checkouts, and of 0 to other conversion types
    return conversionType === CHECKOUT_COMPLETED ? 100 : 0
  }
}

app.get('/conversion', (req, res) => {
  const conversionType = req.query['conversion-type']
  const productCategory = req.query['product-category']
  const triggerData = getTriggerData(conversionType)

  const usePriorities = req.query['prio-checkout'] === 'true'
  const priority = getPriority(conversionType, usePriorities)

  // Use the purchase ID as a deduplication key, since we only want to count purchases with the same ID once
  const deduplicationKey = req.query['purchase-id']
    // Use deduplication only if it's on in the app settings and if a deduplication key is presents
  const useDeduplication = !!(deduplicationKey && req.query['dedup'] === 'true')

  // Set filters
  res.set(
    'Attribution-Reporting-Filters',
    JSON.stringify({
      // Because conversion_product_type has been set to category_1 in the header Attribution-Reporting-Register-Source, any incoming conversion whose productCategory does not match category_1 will be filtered out i.e. will not generate a report.
      conversion_product_type: [productCategory]
    })
  )

  // Event-level report: instruct the browser to schedule-send a report
  res.set(
    'Attribution-Reporting-Register-Event-Trigger',
    // ⚠️ Note the enclosing []!
    JSON.stringify([{
      trigger_data: `${triggerData}`,
      // if priorities are on, specify the priority
      ...(usePriorities && { priority: `${priority}` }),
      // if deduplication is on, specify the deduplication key
      ...(useDeduplication && { deduplication_key: deduplicationKey })
    }])
  )

  // Aggregatable report: instruct the browser to schedule-send a report
  res.set(
    'Attribution-Reporting-Register-Aggregatable-Trigger-Data',
    JSON.stringify([
      // Each dict independently adds pieces to multiple source keys.
      {
        // Conversion type purchase = 2 at a 9 bit offset, i.e. 2 << 9.
        // A 9 bit offset is needed because there are 511 possible campaigns, which
        // will take up 9 bits in the resulting key.
        key_piece: '0x400',
        // Apply this key piece to:
        source_keys: ['campaignCounts']
      }
    ])
  )
  res.set(
    'Attribution-Reporting-Register-Aggregatable-Values',
    JSON.stringify({
      campaignCounts: 32768
    })
  )

  // Debug report (common to event-level and aggregate)
  const legacyMeasurementCookie = req.cookies['measure']
    // Optional: set a debug key, and give it the value of the legacy measurement 3P cookie.
    // This is a simple approach for demo purposes. In a real system, you would still make this key a unique ID, but you may map it to additional trigger-time information that you deem useful for debugging or performance comparison.
  res.set(
    'Attribution-Reporting-Trigger-Debug-Key',
    `${legacyMeasurementCookie}`
  )

  res.sendStatus(200)
})

/* -------------------------------------------------------------------------- */
/*                                 Reports                                    */
/* -------------------------------------------------------------------------- */

app.get('/reports', (req, res) => {
  res.send(JSON.stringify(reports))
})

// Event-level reports
app.post(
  '/.well-known/attribution-reporting/report-event-attribution',
  async(req, res) => {
    console.log('REGULAR REPORT RECEIVED (event-level):', req.body)
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a report from the browser`
    )
    res.sendStatus(200)
  }
)

// Aggregatable reports
app.post(
  '.well-known/attribution-reporting/report-aggregate-attribution',
  async(req, res) => {
    console.log('REGULAR REPORT RECEIVED (aggregate):', req.body)
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a report from the browser`
    )
    res.sendStatus(200)
  }
)

// Event-level Debug reports
app.post(
  '/.well-known/attribution-reporting/debug/report-event-attribution',
  async(req, res) => {
    console.log('DEBUG REPORT RECEIVED (event-level):', req.body)
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a debug report from the browser`
    )
    res.sendStatus(200)
  }
)

// Aggregatable Debug reports
app.post(
  '/.well-known/attribution-reporting/debug/report-aggregate-attribution',
  async(req, res) => {
    console.log('DEBUG REPORT RECEIVED (aggregate):', req.body)
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a debug report from the browser`
    )
    res.sendStatus(200)
  }
)

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech server is listening on port ${listener.address().port}`
  )
})