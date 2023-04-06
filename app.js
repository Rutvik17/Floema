require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const port = 3000

const fetch = require('node-fetch')
const prismic = require('@prismicio/client')
const prismicH = require('@prismicio/helpers')

const accessToken = process.env.PRISMIC_ACCESS_TOKEN
const baseURL = process.env.PRISMIC_ENDPOINT

// Initialize the prismic.io api
const initApi = (req) => {
  return prismic.createClient(baseURL, {
    accessToken,
    req,
    fetch
  })
}

// Link Resolver
const HandleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  // Default to homepage
  return '/'
}

// Add a middleware function that runs on every route. It will inject
// the prismic context to the locals so that we can access these in
// our templates.
app.use((req, res, next) => {
  res.locals.Link = HandleLinkResolver
  res.locals.PrismicH = prismicH
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  // Here we are retrieving the first document from your API endpoint
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  const api = initApi(req)
  const [meta, about] = await Promise.all([
    api.getSingle('meta'),
    api.getSingle('about')
  ])
  // api.get(
  //   prismic.predicate.any('document.type', ['about', 'meta'])
  // )
  console.log(about.data.body)
  res.render('pages/about', {
    about,
    meta
  })
})

app.get('/collection', (req, res) => {
  res.render('pages/collection')
})

app.get('/item/:uid', (req, res) => {
  res.render('pages/item')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
