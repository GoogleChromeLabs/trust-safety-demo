const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8082

app.use(express.static('static'))

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/shoes07', (req, res) => {
  const conversionType = 'visit-product-page'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  res.render('shoes07', { adtechRequestUrl })
})

app.get('/signup-newsletter', (req, res) => {
  const conversionType = 'signup-newsletter'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  res.render('signup-newsletter', { adtechRequestUrl })
})

app.get('/checkout', (req, res) => {
  const conversionType = 'checkout-completed'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  res.render('checkout', { adtechRequestUrl })
})

app.get('/add-to-cart', (req, res) => {
  const conversionType = 'add-to-cart'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  res.render('add-to-cart', { adtechRequestUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
