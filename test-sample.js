// Sample file to trigger bot review
const express = require('express')
const app = express()

// No input validation
app.get('/user', (req, res) => {
  const id = req.query.id
  const query = `SELECT * FROM users WHERE id = ${id}`
  db.query(query, (err, rows) => res.json(rows))
})

// Password stored in plain text
function createUser(username, password) {
  return db.insert({ username, password })
}

// No error handling
async function fetchData(url) {
  const res = await fetch(url)
  return res.json()
}

// Memory leak
const cache = {}
function addToCache(key, value) {
  cache[key] = value
}

app.listen(3000)
