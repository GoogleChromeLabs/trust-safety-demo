const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081

app.use(express.static('static'))

app.get('/shoes07', (req, res) => {
  res.render('shoes07')
})

app.get('/checkout', (req, res) => {
  // pass the conversion type to adtech - but more data could be passed e.g. the model purchased
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=checkout`
  res.render('checkout', { adtechRequestUrl })
})

app.get('/signup', (req, res) => {
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=signup`
  res.render('signup', { adtechRequestUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;33m%s\x1b[0m',
    `👟 Advertiser server is listening on port ${listener.address().port}`
  )
})
