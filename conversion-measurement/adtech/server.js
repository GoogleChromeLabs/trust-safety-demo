const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.use(express.json())
app.set('view engine', 'pug')
const PORT = 3000

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index')
})

/* -------------------------------------------------------------------------- */
/*                                 Ad serving                                 */
/* -------------------------------------------------------------------------- */

app.get('/ad-click', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-click-no-link', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-click-no-link', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-view', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad-view', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-click-view-prio', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
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

// app.get('/ad-script', (req, res) => {
//   res.set('Content-Type', 'text/javascript')
//   const adClickUrl = `${process.env.ADTECH_URL}/ad-click`
//   const adClickNoLinkUrl = `${process.env.ADTECH_URL}/ad-click-no-link`
//   const adViewUrl = `${process.env.ADTECH_URL}/ad-view`
//   const clickIframe = `<iframe src='${adClickUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
//   const clickNoLinkIframe = `<iframe src='${adClickNoLinkUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
//   const viewIframe = `<iframe src='${adViewUrl}' allow='attribution-reporting' width=190 height=190 scrolling=no frameborder=1 padding=0></iframe>`
//   // JS API for views
//   const attributionDestination = process.env.ADVERTISER_URL
//   const attributionReportTo = process.env.ADTECH_URL
//   const call = `window.attributionReporting.registerAttributionSource({
//     attributionSourceEventId: ${Math.floor(Math.random() * 1000000000000000)},
//     attributionDestination: '${attributionDestination}',
//     attributionReportTo: '${attributionReportTo}',
//     attributionExpiry: '864000000'
//   })`

//   // ${call};

//   res.send(
//     `document.write("${clickIframe}");
//     document.write("${clickNoLinkIframe}");
//     document.write("${viewIframe}");
//     console.info('✔️ Adtech script loaded');`
//   )
// })

/* -------------------------------------------------------------------------- */
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */

const conversionValuesClick = {
  // checkout = 1, so that the value is consistent across clicks and views (views must be 0 or 1)
  'checkout-completed': 1,
  'add-to-cart': 2,
  'visit-product-page': 3,
  'signup-newsletter': 4
}

app.get('/conversion', (req, res) => {
  const clickTriggerData = conversionValuesClick[req.query['conversion-type']]
  console.log(clickTriggerData)
  const viewTriggerData =
    req.query['conversion-type'] === 'checkout-completed' ? 1 : 0
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech sends a conversion record request to the browser with conversion data = ${clickTriggerData}`
  )
  // adtech orders the browser to schedule-send a report
  res.redirect(
    302,
    `/.well-known/attribution-reporting/trigger-attribution?trigger-data=${clickTriggerData}&event-source-trigger-data=${viewTriggerData}&priority=100`
  )
  // how to use event-source-trigger-data
  // what's the point if it's not in the report?
  // why is only trigger-data in the report and not even-source-trigger-data?
  // how to use event-source-trigger-data, should I just always set it to one?
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
