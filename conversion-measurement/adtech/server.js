const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.use(express.json())
app.set('view engine', 'pug')
const PORT = 3000
const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index')
})

/* -------------------------------------------------------------------------- */
/*                                 Ad serving                                 */
/* -------------------------------------------------------------------------- */

app.get('/register-source', (req, res) => {
  // Send a response with the header Attribution-Reporting-Register-Source in order to ask the browser to register a source event
  const attributionDestination = process.env.ADVERTISER_URL
  // For demo purposes, sourceEventId is a random ID. In a real system, this ID would be tied to a unique serving-time identifier mapped to any information an adtech provider may need
  const sourceEventId = Math.floor(Math.random() * 1000000000000000)
  res.set('Set-Cookie', 'ar_debug=1; SameSite=None; Secure; HttpOnly')
  res.set(
    'Attribution-Reporting-Register-Source',
    JSON.stringify({
      source_event_id: `${sourceEventId}`,
      destination: attributionDestination,
      expiry: '604800',
      debug_key: '123'
    })
  )
  res.status(200).send('OK')
})

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
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */

const CHECKOUT_COMPLETED = 'checkout-completed'
const ADD_TO_CART = 'add-to-cart'
const VISIT_PRODUCT_PAGE = 'visit-product-page'
const SIGNUP_NEWSLETTER = 'signup-newsletter'

const conversionValues = {
  // checkout = 1, so that the value is consistent across clicks and views
  // trigger data for views (event sources) must be 0 or 1 (1 bit)
  // trigger data for clicks (event sources) must be a value between 0 and 7 (3 bits)
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
    // false: No conversion should be prioritized specifically => always return a prio of 0
    return 0
  } else {
    // Assign a priority of 100 to checkouts, and of 0 to other conversion types
    return conversionType === CHECKOUT_COMPLETED ? 100 : 0
  }
}

app.get('/conversion', (req, res) => {
  const conversionType = req.query['conversion-type']
  const triggerData = getTriggerData(conversionType)

  const usePriorities = req.query['prio-checkout'] === 'true'
  const priority = getPriority(conversionType, usePriorities)

  const deduplicationKey = req.query['purchase-id']
  // Use deduplication only if it's on in the app settings and if a deduplication key is presents
  const useDeduplication = !!(deduplicationKey && req.query['dedup'] === 'true')

  res.set('Attribution-Reporting-Trigger-Debug-Key', '456')

  // Instruct the browser to schedule-send a report
  res.set(
    'Attribution-Reporting-Register-Event-Trigger',
    // ⚠️ Note the enclosing []!
    JSON.stringify([
      {
        trigger_data: `${triggerData}`,
        debug_key: '123',
        // if priorities are on, specify the priority
        ...(usePriorities && { priority: `${priority}` }),
        // if deduplication is on, specify the deduplication key
        ...(useDeduplication && { deduplication_key: deduplicationKey })
      }
    ])
  )
  res.sendStatus(200)
})

/* -------------------------------------------------------------------------- */
/*                                 Reports                                    */
/* -------------------------------------------------------------------------- */

let reports = []

app.get('/reports', (req, res) => {
  res.send(JSON.stringify(reports))
})

app.post(
  '/.well-known/attribution-reporting/debug/report-event-attribution',
  async (req, res) => {
    console.log('DEBUG REPORT RECEIVED:', req.body)
    const newReport = { ...req.body, date: new Date() }
    reports = [newReport, ...reports]
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a debug report from the browser`
    )
    res.sendStatus(200)
  }
)

app.post(
  '/.well-known/attribution-reporting/report-event-attribution',
  async (req, res) => {
    console.log('REGULAR REPORT RECEIVED:', req.body)
    const newReport = { ...req.body, date: new Date() }
    reports = [newReport, ...reports]
    console.log(
      '\x1b[1;31m%s\x1b[0m',
      `🚀 Adtech has received a report from the browser`
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
