const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8080

app.use(express.static('static'))

app.get('/', (req, res) => {
  const { ADTECH_URL, ADVERTISER_URL, PUBLISHER_URL } = process.env
  res.render('index', {
    adtechUrl: ADTECH_URL,
    advertiserUrl: ADVERTISER_URL,
    publisherUrl: PUBLISHER_URL
  })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '🏡 Demo home server is listening on port ' + listener.address().port
  )
})
