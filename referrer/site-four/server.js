const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

app.use(express.static('public'))

app.get('/fetchtest', function (req, res) {
  const referer = req.get('Referer')
  res.send(referer)
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
