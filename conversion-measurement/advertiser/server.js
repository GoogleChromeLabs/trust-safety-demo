const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const session = require('express-session')
const PORT = 8082

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
    // Initialise our variables on the session object (that's persisted across requests by the same user
    req.session.initialized = true
    req.session.prio = true
    req.session.dedup = true
  }
  next()
})

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/settings', (req, res) => {
  const { prio, dedup } = req.session
  res.render('settings', { prio, dedup })
})

app.post('/demo-settings', (req, res) => {
  req.session.prio = req.body.prio
  req.session.dedup = req.body.dedup
  res.render('home')
})

app.post('/new-order', (req, res) => {
  req.session.orderId = Math.floor(Math.random() * 100000)
  res.redirect('checkout')
})

app.get('/shoes07', (req, res) => {
  const conversionType = 'visit-product-page'
  const { prio, dedup } = req.session
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}&prio-checkout=${prio}&dedup=${dedup}`
  res.render('shoes07', { adtechRequestUrl })
})

app.get('/signup-newsletter', (req, res) => {
  const conversionType = 'signup-newsletter'
  const { prio, dedup } = req.session
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}&prio-checkout=${prio}&dedup=${dedup}`
  res.render('signup-newsletter', { adtechRequestUrl })
})

app.get('/checkout', (req, res) => {
  if (!req.session.orderId) {
    req.session.orderId = Math.floor(Math.random() * 100000)
  }
  const conversionType = 'checkout-completed'
  const { prio, dedup, orderId } = req.session

  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}&prio-checkout=${prio}&dedup=${dedup}&order-id=${orderId}`

  res.render('checkout', { adtechRequestUrl, orderId })
})

app.get('/add-to-cart', (req, res) => {
  const conversionType = 'add-to-cart'
  const { prio, dedup } = req.session
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}&prio-checkout=${prio}&dedup=${dedup}`
  res.render('add-to-cart', { adtechRequestUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
