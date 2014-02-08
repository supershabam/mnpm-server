var express = require('express')
var fs = require('fs')
var mongodb = require('mongodb')
var RSVP = require('rsvp')

var mongoUri = process.env.MONGOHQ_URL || 'mongodb://localhost/test'
var Promise = RSVP.Promise
var app = express()
var _db = null

app.use(express.bodyParser())

function db() {
  if (!_db) {
    _db = new Promise(function(resolve, reject) {
      mongodb.MongoClient.connect(mongoUri, function(err, db) {
        if (err) {
          return reject(err)
        } 
        db.collection('modules').ensureIndex({name: 1, version: 1}, {unique: true}, function(err) {
          if (err) {
            return reject(err)
          }
          resolve(db)
        })
      })
    })
  }
  return _db
}

function ensureParameters(module) {
  return new Promise(function(resolve, reject) {
    if (typeof module.name !== 'string') {
      return reject(new Error('expected name parameter'))
    }
    if (typeof module.version !== 'string') {
      return reject(new Error('expected version parameter'))
    }
    resolve(true)
  })
}

function saveToDatabase(dbPromise, module) {
  return dbPromise.then(function(db) {
    return new Promise(function(resolve, reject) {
      var doc = {
        name: module.name,
        version: module.version,
        dependencies: module.dependencies
      }
      db.collection('modules').insert(doc, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

// todo - handle module names that make invalid file
function moduleFilename(module) {
  return module.name +  module.version
}

function saveToDisk(module) {
  var filename = moduleFilename(module)
  var basepath = process.cwd
}

function handlePutModule(module) {
  return ensureParameters(module).then(function() {
    return saveToDatabase(db(), module).then(function() {
      return saveToDisk(module)
    })
  })
}

app.put('/module', function(req, res, next) {
  console.log(req.body)
  handlePutModule(req.body).then(function() {
    res.send(201)
  }, next)
})

app.listen(process.env.PORT || 9001)
