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

const functions = require('firebase-functions')
const express = require('express')
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const session = require('express-session')

const PORT = 8082
const demoHomeUrl = process.env.DEMO_HOME_URL
const publisherUrl = process.env.PUBLISHER_URL
const advertiserUrl = process.env.ADVERTISER_URL
const adtechUrl = process.env.ADTECH_URL

const advertiser = express()
advertiser.set('view engine', 'pug')
advertiser.set('views', './views/advertiser')
advertiser.use(
  session({
    secret: '343ji43j4n3jn4jk3n',
    saveUninitialized: true,
    resave: true
  })
)

advertiser.use(express.json())

// Middleware run on each request
advertiser.use((req, res, next) => {
  // Check if session is initialized
  if (!req.session.initialized) {
    // Initialize variables on the session object (persisted across requests made by the same user)
    req.session.initialized = true
    req.session.prio = false
    req.session.dedup = false
  }
  next()
})

advertiser.get('/', (req, res) => {
  res.render('home', { demoHomeUrl, publisherUrl, advertiserUrl, adtechUrl })
})

advertiser.get('/settings', (req, res) => {
  const { prio, dedup } = req.session
  res.render('settings', {
    prio,
    dedup,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.post('/demo-settings', (req, res) => {
  req.session.prio = req.body.prio
  req.session.dedup = req.body.dedup
  const { prio, dedup } = req.session
  res.render('settings', {
    prio,
    dedup,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.post('/new-purchase', (req, res) => {
  req.session.purchaseId = Math.floor(Math.random() * 100000)
  res.redirect('checkout')
})

advertiser.get('/blue-shoes', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'visit-product-page',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`
  res.render('blue-shoes', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.get('/signup-newsletter', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'signup-newsletter',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('signup-newsletter', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.get('/checkout', (req, res) => {
  if (!req.session.purchaseId) {
    req.session.purchaseId = Math.floor(Math.random() * 100000)
  }
  const { prio, dedup, purchaseId } = req.session

  const searchParams = new URLSearchParams({
    'conversion-type': 'checkout-completed',
    'product-category': 'category_1',
    'purchase-value': 200,
    'prio-checkout': prio,
    dedup: dedup,
    'purchase-id': purchaseId
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('checkout', {
    adtechRequestUrl,
    purchaseId,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.get('/add-to-cart', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'add-to-cart',
    'product-category': 'category_1',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('add-to-cart', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

advertiser.get('/t-shirt', (req, res) => {
  const { prio, dedup } = req.session
  const searchParams = new URLSearchParams({
    'conversion-type': 'visit-product-page',
    'product-category': 'category_2',
    'prio-checkout': prio,
    dedup: dedup
  })

  const adtechRequestUrl = `${
    process.env.ADTECH_URL
  }/conversion?${searchParams.toString()}`

  res.render('t-shirt', {
    adtechRequestUrl,
    demoHomeUrl,
    publisherUrl,
    advertiserUrl,
    adtechUrl
  })
})

exports.advertiser = functions.https.onRequest(advertiser)
