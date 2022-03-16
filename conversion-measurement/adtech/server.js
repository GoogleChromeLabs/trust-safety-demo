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
  res.set(
    'Attribution-Reporting-Register-Source',
    JSON.stringify({
      source_event_id: `${sourceEventId}`,
      destination: attributionDestination,
      expiry: '604800000'
    })
  )
  res.status(200).send('OK')
})

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

app.get('/ad-click-js', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click-js', {
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

const conversionValuesClick = {
  [CHECKOUT_COMPLETED]: 1,
  [ADD_TO_CART]: 2,
  [VISIT_PRODUCT_PAGE]: 3,
  [SIGNUP_NEWSLETTER]: 4
}

function getPriorityValue(conversionType, prioritizeCheckouts) {
  if (!prioritizeCheckouts) {
    // false: No conversion should be prioritized specifically => always return a prio of 0
    return 0
  } else {
    // true: Assign a prio of 100 to checkouts, and 0 to others
    return conversionType === CHECKOUT_COMPLETED ? 100 : 0
  }
}

app.get('/conversion', (req, res) => {
  // const conversionType = req.query['conversion-type']
  // // Define trigger data depending on the conversion type; it can be between 0 and 7 (3 bits)
  // const clickTriggerData = conversionValuesClick[conversionType]
  // const prioritizeCheckouts = req.query['prio-checkout'] === 'true'
  // const useDeduplication = req.query['dedup'] === 'true'
  // const priorityValue = getPriorityValue(conversionType, prioritizeCheckouts)
  // let url = `/.well-known/attribution-reporting/trigger-attribution?trigger-data=${clickTriggerData}&priority=${priorityValue}`
  // if (useDeduplication) {
  //   const purchaseId = req.query['purchase-id']
  //   url = `${url}&dedup-key=${purchaseId}`
  // }
  // // Adtech orders the browser to schedule-send a report
  // res.redirect(302, url)
  // console.log('trigger')
  res.set(
    'Attribution-Reporting-Register-Event-Trigger',
    JSON.stringify([
      {
        trigger_data: '1'
      }
    ])
  )
  res.status(200).send('OK')
})

/* -------------------------------------------------------------------------- */
/*                                 Reports                                    */
/* -------------------------------------------------------------------------- */

let reports = []

app.get('/reports', (req, res) => {
  res.send(JSON.stringify(reports))
})

app.post(
  '/.well-known/attribution-reporting/report-event-attribution',
  async (req, res) => {
    console.log('body', req.body)
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
