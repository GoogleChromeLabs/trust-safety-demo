/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
