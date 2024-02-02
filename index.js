require('dotenv').config({ path: './.env' })
const express = require('express')
const { MongoClient } = require('mongodb')
const Database = require('./database')
const db = new Database()
const app = express()
const port = process.env.PORT || 3000
const processPages = require('./main')

var database

const mongoUser = process.env.MONGO_USER
const monogPass = process.env.MONGO_PASS
const mongodb = process.env.DB
MongoClient.connect(`mongodb+srv://${mongoUser}:${monogPass}@cluster0.ywsn7md.mongodb.net/`, { useNewUrlParser: true }, (err, result) => {
    if (err) throw err
    database = result.db(mongodb)
    db.setDB(database)
})

app.get('/', (req, res) => res.send('everything ok'))
app.get('/start', (req, res) => {
    try {
        processPages()
        return res.send('scraping started')
    } catch (error) {
        return res.send('scraping started with error')
    }
})

app.listen(port, () => {
    console.log(` Server running on port : ${port}!`)
})
