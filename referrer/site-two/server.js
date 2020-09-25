const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

// use a view engine for convenience, so I can display server-collected info (= the referrer in our case) in the HTML markup
// http://expressjs.com/en/guide/using-template-engines.html
app.set('view engine', 'pug')

app.use(express.static('public'))

app.get('/', function (req, res) {
  const referrer = req.get('Referer')
  const referrerToDisplay = referrer || ''
  res.render('index', { referrer: `${referrerToDisplay}` })
})

app.get('/ifr', function (req, res) {
  const referrer = req.get('Referer')
  const referrerToDisplay = referrer || ''
  res.render('index', { referrer: `${referrerToDisplay}` })
})

app.get('/ref', function (req, res) {
  const referrer = req.get('Referer')
  res.send(referrer)
})

app.get('/cross-o-img', function (req, res) {
  const referrer = req.get('Referer')
  console.log(referrer)
  if (!referrer) {
    res.sendFile(__dirname + '/assets/empty.jpg')
  } else if (referrer.includes('stuff')) {
    res.sendFile(__dirname + '/assets/full.jpg')
  } else if (referrer.length > 0) {
    res.sendFile(__dirname + '/assets/origin.jpg')
  } else {
    res.sendFile(__dirname + '/assets/empty.jpg')
  }
})

app.get('/cross-o-script', function (req, res) {
  const elId = req.query.elId
  const referrer = req.get('Referer') || 'empty (no referrer)'
  res.send(`document.getElementById("${elId}").innerText = '${referrer}'`)
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
