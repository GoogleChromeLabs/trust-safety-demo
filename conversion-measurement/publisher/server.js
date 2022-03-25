const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081
const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('index', { demoHomeUrl, publisherUrl, advertiserUrl, adtechUrl })
})

app.get('/click-element', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-element`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/click-js', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-js`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/view-element-img', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-view-img`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/view-js', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-view-js`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;32m%s\x1b[0m',
    `📰 Publisher server is listening on port ${listener.address().port}`
  )
})
