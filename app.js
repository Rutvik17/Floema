require('dotenv').config()
const express = require('express')
const errorHandler = require('errorhandler')
const app = express()
const path = require('path')
const port = 3000

const fetch = require('node-fetch')
const prismic = require('@prismicio/client')
const prismicH = require('@prismicio/helpers')

const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const logger = require('morgan')

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

app.use(logger('dev'))
app.use(errorHandler())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())

app.use(express.static(path.join(__dirname, 'public')))

// Add a middleware function that runs on every route. It will inject
// the prismic context to the locals so that we can access these in
// our templates.
app.use((req, res, next) => {
  res.locals.Link = HandleLinkResolver
  res.locals.PrismicH = prismicH
  res.locals.Numbers = (index) => {
    return index === 0
      ? 'One'
      : index === 1
        ? 'Two'
        : index === 2
          ? 'Three'
          : index === 3
            ? 'Four'
            : ''
  }
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async (api) => {
  const meta = await api.getSingle('meta')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')
  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  // Here we are retrieving the first document from your API endpoint
  const api = initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')
  const collections = await api.getAllByType(
    'collection', { fetchLinks: 'product.image' }
  )

  res.render('pages/home', {
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = initApi(req)
  const [meta, about, navigation, preloader] = await Promise.all([
    api.getSingle('meta'),
    api.getSingle('about'),
    api.getSingle('navigation'),
    api.getSingle('preloader')
  ])
  // api.get(
  //   prismic.predicate.any('document.type', ['about', 'meta'])
  // )

  console.log(navigation)
  res.render('pages/about', {
    about,
    meta,
    navigation,
    preloader
  })
})

app.get('/collections', async (req, res) => {
  const api = initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')
  const collections = await api.getAllByType(
    'collection', { fetchLinks: 'product.image' }
  )

  res.render('pages/collections', {
    ...defaults,
    collections,
    home
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
