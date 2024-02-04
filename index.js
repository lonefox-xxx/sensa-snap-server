require('dotenv').config({ path: './.env' })
require('./database/redis')
require('./database/mongodb')
const express = require('express')
const { MongoClient } = require('mongodb')
const app = express()
const port = process.env.PORT || 3000
const processPages = require('./main')
const path = require('path')
const ConvertandSendInitialPhotos = require('./helper/sendinitialphotos')
const handleAutoUpload = require('./crons/handleAutoupload')

app.get('/', (req, res) => res.send('everything ok'))
app.get('/start', (req, res) => {
    try {
        processPages()
        return res.send('scraping started')
    } catch (error) {
        return res.send('scraping started with error')
    }
})
app.get('/getdatafile', (req, res) => { res.sendFile(path.join(__dirname, './resdata.json')) })
app.get('/saveIds', require('./helper/id'))
app.get('/updateposts', require('./crons/updatepots'))

app.get('/startconvertandsendinitialphotos', (req, res) => {
    try {
        ConvertandSendInitialPhotos()
        return res.send('convert and sendinitialphotos started')
    } catch (error) {
        return res.send('scraping started with error')
    }
})


// Cron jobs
handleAutoUpload()

app.listen(port, () => {
    console.log(`Server running on port : ${port}!`)
})
