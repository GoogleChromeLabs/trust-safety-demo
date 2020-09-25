const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

app.use(express.static('public'))

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
