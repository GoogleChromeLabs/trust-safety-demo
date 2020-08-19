const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const app = express()
app.set('view engine', 'pug')
const PORT = 8080

app.use(express.static('static'))

app.get('/', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/script`
  res.render('index', { adScriptUrl })
})

const listener = app.listen(process.env.PORT || PORT, () => {
  console.log(
    '📰 Publisher server is listening on port ' + listener.address().port
  )
})
