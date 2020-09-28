const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081

app.use(express.static('static'))

app.get('/shoes07', (req, res) => {
  res.render('shoes07')
})

app.get('/shoes07/added-to-cart', (req, res) => {
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?model=shoes07&type=add-to-cart`
  res.render('shoes07-added-to-cart', { adtechRequestUrl })
})

app.get('/shoes07/checkout', (req, res) => {
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?model=shoes07&type=checkout`
  res.render('shoes07-checkout', { adtechRequestUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
