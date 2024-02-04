require('dotenv').config({ path: './.env' })
require('./database/redis')
require('./database/mongodb')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const processPages = require('./main')
const path = require('path')
const ConvertandSendInitialPhotos = require('./helper/sendinitialphotos')
const handleAutoUpload = require('./crons/handleAutoupload')
const Database = require('./database/database')
const { default: axios } = require('axios')
const db = new Database()
const BOT_TOKEN = process.env.BOT_TOKEN
const cors = require('cors')

app.use(cors({
    origin: '*'
}))

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

app.get('/getphoto', async (req, res) => {
    const { id } = req.query
    if (!id) return res.send({ success: false, msg: 'on item is specified!' })

    const { data } = await db.getLogs({ id }, 'photos')
    if (data.length <= 0) return res.send({ success: false, msg: `Post can't find` })
    const dataUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data[0].photostorageData.file}`
    const { data: postData } = await axios.get(dataUrl)

    res.send({ success: true, msg: 'success', postData })
})
// Cron jobs
handleAutoUpload()

app.listen(port, () => {
    console.log(`Server running on port : ${port}!`)
})





















