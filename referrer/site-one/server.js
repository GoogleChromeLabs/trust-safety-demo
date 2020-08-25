const express = require('express')
const app = express()

// Sets "Referrer-Policy: same-origin".
// const helmet = require('helmet')
// app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
// use a view engine for convenience
// so I can display server-collected info (= the referer in that case) in the HTML markup
// http://expressjs.com/en/guide/using-template-engines.html
// app.set('view engine', 'pug')

// make all the files in 'public' available
app.use(express.static('public'))

app.get('/ref', function (req, res) {
  const referer = req.get('Referer')
  res.send(referer)
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/stuff/detail', (req, res) => {
  res.sendFile(__dirname + '/views/detail.html')
})

const listener = app.listen(process.env.PORT, () => {
  console.log('App is listening on port ' + listener.address().port)
})
