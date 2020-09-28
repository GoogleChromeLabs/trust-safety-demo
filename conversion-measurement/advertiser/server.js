const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8082

app.use(express.static('static'))

app.get('/shoes07', (req, res) => {
  res.render('shoes07')
})

app.get('/checkout', (req, res) => {
  // pass the conversion type to adtech - but more data could be passed e.g. the model purchased
  const conversionType = 'checkout'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  const adtechServerUi = `${process.env.ADTECH_URL}`
  res.render('checkout', { adtechRequestUrl, adtechServerUi })
})

app.get('/signup', (req, res) => {
  const conversionType = 'signup'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  const adtechServerUi = `${process.env.ADTECH_URL}`
  res.render('signup', { adtechRequestUrl, adtechServerUi })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
