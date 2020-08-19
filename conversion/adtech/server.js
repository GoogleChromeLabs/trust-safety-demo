const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
// TODO make it env var
const PORT = 3000
// TODO clean pug files

// Utils

function toHex(value, maxValue) {
  return (parseInt(value, 16) % maxValue).toString(16)
}

// Conversion logics

const conversionValues = {
  checkout: 1,
  'add-to-cart': 2,
  signup: 3
}

const maxValue = Math.max(...Object.values(conversionValues))

const getConversionData = (value) => toHex(value, maxValue)

// Reports

let reports = []

// Server

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/ad', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoe07`
  const conversionDestination = process.env.ADVERTISER_URL
  const reportingOrigin = process.env.ADTECH_URL
  res.render('ad', {
    href,
    conversiondestination: conversionDestination,
    reportingorigin: reportingOrigin
  })
})

// TODO rename "script"
app.get('/script', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adUrl = `${process.env.ADTECH_URL}/ad`
  res.send(
    `console.log('✔️ Loaded adtech script'); document.write("<iframe src='${adUrl}' allow='conversion-measurement' width=200 height=230 scrolling=no frameborder=1 padding=0></iframe>")`
  )
})

app.get('/conversion', (req, res) => {
  // TODO what if 3?
  const priceBucket = conversionValues[req.query.type]
  const conversionData = getConversionData(priceBucket)
  res.redirect(
    302,
    `/.well-known/register-conversion?conversion-data=${conversionData}`
  )
})

app.get('/reports', (req, res) => {
  res.send(JSON.stringify(reports))
})

app.post('/*', (req, res) => {
  const newReport = req.query
  console.log(req.query)
  reports = [...reports, newReport]
  // TODO response OK
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '🚀 Adtech server is listening on port ' + listener.address().port
  )
})
