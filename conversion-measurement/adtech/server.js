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

app.get('/ad-click', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-click-no-link', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click-no-link', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-view', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-view', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-click-view-prio', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click-view-prio', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-script-click-element', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adClickUrl = `${process.env.ADTECH_URL}/ad-click`
  const iframe = `<iframe src='${adClickUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

app.get('/ad-script-click-js', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adClickNoLinkUrl = `${process.env.ADTECH_URL}/ad-click-no-link`
  const iframe = `<iframe src='${adClickNoLinkUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${iframe}");`)
})

app.get('/ad-script-view-element', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adViewUrl = `${process.env.ADTECH_URL}/ad-view`
  const viewIframe = `<iframe src='${adViewUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${viewIframe}");`)
})

app.get('/ad-script-view-js', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  // JS API for views
  const call = `window.attributionReporting.registerAttributionSource({
    attributionSourceEventId: ${Math.floor(Math.random() * 1000000000000000)},
    attributionDestination: '${attributionDestination}',
    attributionReportTo: '${attributionReportTo}',
    attributionExpiry: '864000000'
  })`
  res.send(`${call};`)
})

app.get('/ad-script-click-and-view-with-prio', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adPrioUrl = `${process.env.ADTECH_URL}/ad-click-view-prio`
  const adIframe = `<iframe src='${adPrioUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
  res.send(`document.write("${adIframe}");`)
})

/* -------------------------------------------------------------------------- */
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */

const CHECKOUT_COMPLETED = 'checkout-completed'
const ADD_TO_CART = 'add-to-cart'
const VISIT_PRODUCT_PAGE = 'visit-product-page'
const SIGNUP_NEWSLETTER = 'signup-newsletter'

const conversionValuesClick = {
  // checkout = 1, so that the value is consistent across clicks and views (views must be 0 or 1)
  [CHECKOUT_COMPLETED]: 1,
  [ADD_TO_CART]: 2,
  [VISIT_PRODUCT_PAGE]: 3,
  [SIGNUP_NEWSLETTER]: 4
}

function getPriorityValue(conversionType, prioritizeCheckouts) {
  if (!prioritizeCheckouts) {
    // false: No conversion should be prioritizes specifically => always return a prio of 0
    return 0
  } else {
    // true: Assign a prio of 100 to checkouts, and 0 to others
    return conversionType === CHECKOUT_COMPLETED ? 100 : 0
  }
}

app.get('/conversion', (req, res) => {
  const conversionType = req.query['conversion-type']
  // Define trigger data depending on the conversion type; it can be between 0 and 7 (3 bits)
  const clickTriggerData = conversionValuesClick[conversionType]
  // Define trigger data depending on the conversion type for views; it has to be 0 or 1 (1 bit only)
  const viewTriggerData = conversionType === CHECKOUT_COMPLETED ? 1 : 0
  const prioritizeCheckouts = req.query['prio-checkout'] === 'true'
  const useDeduplication = req.query['dedup'] === 'true'

  const priorityValue = getPriorityValue(conversionType, prioritizeCheckouts)

  let url = `/.well-known/attribution-reporting/trigger-attribution?trigger-data=${clickTriggerData}&event-source-trigger-data=${viewTriggerData}&priority=${priorityValue}`

  if (useDeduplication) {
    const purchaseId = req.query['purchase-id']
    url = `${url}&dedup-key=${purchaseId}`
  }
  // Adtech orders the browser to schedule-send a report
  res.redirect(302, url)
})

/* -------------------------------------------------------------------------- */
/*                                 Reports                                    */
/* -------------------------------------------------------------------------- */

let reports = []

app.get('/reports', (req, res) => {
  res.send(JSON.stringify(reports))
})

app.post('/*', async (req, res) => {
  console.log('body', req.body)
  const newReport = { ...req.body, date: new Date() }
  reports = [newReport, ...reports]
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech has received a report from the browser`
  )
  res.sendStatus(200)
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech server is listening on port ${listener.address().port}`
  )
})
