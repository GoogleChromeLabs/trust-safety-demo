const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8080

app.use(express.static('static'))

app.get('/', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script`
  res.render('index', { adScriptUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '\x1b[1;32m%s\x1b[0m',
    `📰 Publisher server is listening on port ${listener.address().port}`
  )
})
