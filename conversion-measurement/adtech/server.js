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

app.get('/ad', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  const attributionDestination = process.env.ADVERTISER_URL
  const attributionReportTo = process.env.ADTECH_URL
  res.render('ad', {
    href,
    attributiondestination: attributionDestination,
    attributionreportto: attributionReportTo
  })
})

app.get('/ad-script', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adUrl = `${process.env.ADTECH_URL}/ad`
  res.send(
    `console.info('✔️ Adtech script loaded'); document.write("<iframe src='${adUrl}' allow='attribution-reporting' width=190 height=200 scrolling=no frameborder=1 padding=0></iframe>")`
  )
})

/* -------------------------------------------------------------------------- */
/*                     Attribution trigger (conversion)                       */
/* -------------------------------------------------------------------------- */

const conversionValues = {
  signup: 1,
  checkout: 2
}

app.get('/conversion', (req, res) => {
  const attributionTriggerData = conversionValues[req.query['conversion-type']]
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech sends a conversion record request to the browser with conversion data = ${attributionTriggerData}`
  )
  // adtech orders the browser to schedule-send a report
  res.redirect(
    302,
    `/.well-known/attribution-reporting/trigger-attribution?trigger-data=${attributionTriggerData}`
  )
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
