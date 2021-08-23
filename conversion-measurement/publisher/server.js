const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8081

app.use(express.static('static'))

app.get('/click-element', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-element`
  res.render('index', { adScriptUrl })
})

app.get('/click-js', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-js`
  res.render('index', { adScriptUrl })
})

app.get('/view-element', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-view-element`
  res.render('index', { adScriptUrl })
})

app.get('/view-js', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-view-js`
  res.render('index', { adScriptUrl })
})

app.get('/click-and-view-with-prio', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-and-view-with-prio`
  res.render('index', { adScriptUrl })
})

// app.get('/', (req, res) => {
//   const adScriptUrl = `${process.env.ADTECH_URL}/ad-script`
//   res.render('index', { adScriptUrl })
// Measure clicks
// Measure views
// Measure clicks and views
// With prios
// With dedup
// })

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;32m%s\x1b[0m',
    `📰 Publisher server is listening on port ${listener.address().port}`
  )
})
