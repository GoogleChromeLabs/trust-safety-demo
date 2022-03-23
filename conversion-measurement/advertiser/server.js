const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const session = require('express-session')

const PORT = 8082
const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

const app = express()
app.set('view engine', 'pug')
app.use(
  session({
    secret: '343ji43j4n3jn4jk3n',
    saveUninitialized: true,
    resave: true
  })
)

app.use(express.json())
app.use(express.static('static'))

// Middleware run on each request
app.use((req, res, next) => {
  // Check if session is initialized
  if (!req.session.initialized) {
    // Initialize variables on the session object (persisted across requests made by the same user)
    req.session.initialized = true
    req.session.prio = false
    req.session.dedup = false
  }
  next()
})

app.get('/', (req, res) => {
  res.render('home', { demoHomeUrl, publisherUrl, advertiserUrl, adtechUrl })
})

app.get('/settings', (req, res) => {
  const { prio, dedup } = req.session
  res.render('settings', {
    prio,
    dedup,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.post('/demo-settings', (req, res) => {
  req.session.prio = req.body.prio
  req.session.dedup = req.body.dedup
  const { prio, dedup } = req.session
  res.render('settings', {
    prio,
    dedup,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.post('/new-purchase', (req, res) => {
  req.session.purchaseId = Math.floor(Math.random() * 100000)
  res.redirect('checkout')
})

app.get('/blue-shoes', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'visit-product-page',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`
  res.render('blue-shoes', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/signup-newsletter', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'signup-newsletter',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('signup-newsletter', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/checkout', (req, res) => {
  if (!req.session.purchaseId) {
    req.session.purchaseId = Math.floor(Math.random() * 100000)
  }
  const conversionType = 'checkout-completed'
  const { prio, dedup, purchaseId } = req.session

  const searchParams = new URLSearchParams({
    'conversion-type': 'signup-newsletter',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup,
    'purchase-id': purchaseId
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('checkout', {
    adtechRequestUrl,
    purchaseId,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/add-to-cart', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'add-to-cart',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('add-to-cart', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

app.get('/t-shirt', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'visit-product-page',
    'product-category': 'category_2',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('t-shirt', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
