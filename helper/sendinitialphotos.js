const fs = require('fs');
const ConvertImagetoBinaryURL = require('../utils/ConvertImagetoBinaryURL');
const Database = require('../database/database');
const { default: axios } = require('axios');
const FormData = require('form-data');
const db = new Database()

async function ConvertandSendInitialPhotos() {
    try {
        const data = fs.readFileSync('./resdata.json', 'utf8');
        const initialData = JSON.parse(data).slice(0, 100);

        for (let i = 0; i < initialData.length; i++) {
            const item = initialData[i];
            const { data: { id, photos, title }, page } = item
            const photoData = []
            console.log(`processing ${id}...`)

            for (let pi = 0; pi < photos.length; pi++) {
                const photo = photos[pi];
                console.log(`processing photo ${photo.id}`)
                const { success, dataURL, buffer } = await ConvertImagetoBinaryURL(photo.src)
                photoData.push({ id: photo.id, src: dataURL, url: photo.src })
                console.log(`processing completed photo ${photo.id}`)
            }

            const preview = selectePreview(photoData);
            const path = `${id}.json`
            const Data = { id, title, created: new Date().getTime(), preview, photoData, page }
            fs.writeFileSync(path, JSON.stringify(Data));
            const [storageData, sendData] = await Promise.all([
                sendFile(path),
                sendMsg(title, preview.url, `https://sensa-snap.vercel.app/photo/${id}`)
            ])
            await db.addLogs({ id, photostorageData: storageData, photoData: sendData }, 'photos')
            fs.unlinkSync(path)
            console.log(`processing completed ${id}`)
            await sleep((60000 / 4))
        }

    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error.message);
    }
}

async function sendFile(path) {
    const botToken = "6831900257:AAG8MBE0FKJIaB44qbAWQVfpswN9v9OH6xI";
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
    const chatId = -1002036233882;
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

    const botToken = '6831900257:AAG8MBE0FKJIaB44qbAWQVfpswN9v9OH6xI';
    const channelId = '@sensasnap';

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

function selectePreview(imagearray) {
    return imagearray[0];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = ConvertandSendInitialPhotos