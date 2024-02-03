const client = require("../database/redis");
const MoveFirstToLast = require("../helper/movefirsttolast");
const fs = require('fs');
const ConvertImagetoBinaryURL = require("../utils/ConvertImagetoBinaryURL");
const Database = require("../database/database");
const { default: axios } = require("axios");
const FormData = require("form-data");
const db = new Database()

const botToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID
const STORAGE_CHANNELID = process.env.STORAGE_CHANNELID

async function updatepots() {
    const ids = JSON.parse(await client.get('ids')) || []
    const selectedID = ids[0]
    const selectedItem = getItemwithID(selectedID)
    await ConvertandSendPhotos(selectedItem)
    const updatedIDs = MoveFirstToLast(ids)
    await client.set('ids', JSON.stringify(updatedIDs))
}


function getItemwithID(id) {
    const items = JSON.parse(fs.readFileSync('./resdata.json')) || []
    const selectedItems = items.filter(item => item.data.id == id)
    return selectedItems
}

async function ConvertandSendPhotos(item) {
    try {
        const { data: { id, photos, title }, page } = item[0]
        const photoData = []
        for (let pi = 0; pi < photos.length; pi++) {
            const photo = photos[pi];
            console.log(`processing photo ${photo.id}`)
            const { success, dataURL, buffer } = await ConvertImagetoBinaryURL(photo.src)
            photoData.push({ id: photo.id, src: dataURL, url: photo.src })
            console.log(`processing completed photo ${photo.id}`)
        }
        console.log(`processing ${id}...`)
        const preview = photoData[0];
        const path = `${id}.json`
        const Data = { id, title, created: new Date().getTime(), preview, photoData, page }
        fs.writeFileSync(path, JSON.stringify(Data));
        const [storageData, sendData] = await Promise.all([sendFile(path), sendMsg(title, preview.url, `https://sensa-snap.vercel.app/photo/${id}`),])
        await db.addLogs({ id, photostorageData: storageData, photoData: sendData }, 'photos')
        fs.unlinkSync(path)
        console.log(`processing completed ${id}`)
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error.message);
    }
}


async function sendFile(path) {
    const botToken = "6831900257:AAG8MBE0FKJIaB44qbAWQVfpswN9v9OH6xI";
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
    const chatId = STORAGE_CHANNELID;
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("document", fs.createReadStream(path));
    formData.append("caption", "");
    const { data: { result: { document: { file_id, file_name, file_unique_id } } } } = await axios.post(apiUrl, formData, { headers: formData.getHeaders() });
    const fileform = new FormData();
    fileform.append("file_id", file_id);
    const fileapi = `https://api.telegram.org/bot${botToken}/getFile`;
    const { data: { result: { file_path } } } = await axios.post(fileapi, fileform, { headers: fileform.getHeaders() });
    const res = {
        file_id,
        file: file_path,
        file_name,
        file_unique_id
    }
    return res;
}

async function sendMsg(title, imagsrc, destination) {

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const messageCaption = `${title}!\n\n[click heare to see all photos](${destination})\n\njoin ${channelId} for more`;
    const payload = {
        chat_id: channelId,
        photo: imagsrc,
        caption: messageCaption,
        parse_mode: 'Markdown',
    };
    const { data } = await axios.post(apiUrl, payload)
    return data

}

module.exports = updatepots;