var express = require('express')
var fs = require('fs')
var nano = require('nano')
var path = require('path')
var RSVP = require('rsvp')

var Promise = RSVP.Promise
var app = express()
var couch = nano(process.env.COUCHDB_URI || 'http://localhost:5984')
var registry = couch.use(process.env.COUCHDB_DATABASE || 'registry')
var port = process.env.PORT || 8080

app.use(express.logger())

app.param('module', function(req, res, next, module) {
  registry.get(module, function(err, doc) {
    if (err) {
      return next(err)
    }
    if (!doc) {
      return next(new Error('unable to find module ' + module))
    }
    req.module = doc
    next()
  })
})

// not a standard http mirror function, but we'll use it for now
app.get('/:module', function(req, res, next) {
  res.json({
    files: Object.keys(req.module.versions)
  })
})

app.get('/:module/:file', function(req, res, next) {
  registry.attachment.get(req.module.name, req.params.file).pipe(res)
})

app.listen(process.env.PORT || 9001)
