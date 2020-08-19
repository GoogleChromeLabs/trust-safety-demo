const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081

app.use(express.static('static'))

app.get('/shoe07', (req, res) => {
  res.render('shoe07')
})

app.get('/shoe07/added-to-cart', (req, res) => {
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?model=shoe07&type=add-to-cart`
  res.render('shoe07-added-to-cart', { adtechRequestUrl })
})

app.get('/shoe07/checkout', (req, res) => {
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?model=shoe07&type=checkout`
  res.render('shoe07-checkout', { adtechRequestUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '👟 Advertiser server is listening on port ' + listener.address().port
  )
})
