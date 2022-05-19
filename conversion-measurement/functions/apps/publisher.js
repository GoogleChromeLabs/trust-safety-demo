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

const functions = require('firebase-functions');
const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const publisher = express()
publisher.set('view engine', 'pug')
publisher.set('views', './views/publisher')

const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

publisher.get('/', (req, res) => {
  res.render('index', { demoHomeUrl, publisherUrl, advertiserUrl, adtechUrl })
})

publisher.get('/click-element', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-element`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

publisher.get('/click-js', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-click-js`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

publisher.get('/view-element-img', (req, res) => {
  const adScriptUrl = `${process.env.ADTECH_URL}/ad-script-view-img`
  res.render('article', {
    adScriptUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

exports.publisher = functions.https.onRequest(publisher);
