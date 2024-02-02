const { default: axios } = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const classifyImages = require('./utils/classifyimgs');
const fetchDataWithRetry = require('./utils/fetchDataWithRetry');
const ConvertImagetoBinaryURL = require('./utils/ConvertImagetoBinaryURL');
const crypto = require('crypto');
const FormData = require("form-data");
const Database = require('./database');
const db = new Database()

const totalPages = 1
let i = 1
let t = 0

const dataArray = []

async function getPages(i) {
    console.log(`Scraping page : ${i}`)
    try {
        const { data } = await fetchDataWithRetry({ url: `https://www.sexvid.xxx/photos/rating/${i}/` });
        const $ = cheerio.load(data);

        for (const element of $('a.images_wrapper')) {
            const page = $(element).attr('href');
            const title = $(element).attr('title');
            const photos = await extractPhotos(page)
            const preview = await selectePreview(photos.photos);
            const Data = {
                title,
                created: new Date().getTime(),
                preview: preview.id,
                ...photos
            }
            const path = `${photos.id}.json`
            fs.writeFileSync(path, JSON.stringify(Data, null, 2));
            const sendres = await sendFile(path)
            await db.addLogs({ id: photos.id, photoData: sendres }, 'photos')
            dataArray.push({ page, title, photos })
            fs.unlinkSync(path)
        }

        return true;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        throw error;
    }
}


async function extractPhotos(link) {
    const { data } = await fetchDataWithRetry({ url: link });
    const $ = cheerio.load(data);

    const photos = [];

    await Promise.all(
        $('div.item').map(async (index, element) => {
            const imgSrc = $(element).find('img').attr('src');
            const { dataURL, buffer, success } = await ConvertImagetoBinaryURL(imgSrc);
            const id = crypto.randomBytes(16).toString('hex');
            if (success) {
                const probability = await classifyImages(buffer);
                photos.push({ id, src: dataURL, probability });
            }
        }).get()
    );

    t += 1;

    const rating = photos.reduce((acc, current) => {
        const { Sexy = 0, Porn = 0, Neutral = 0, Hentai = 0 } = current.probability;
        return {
            porny: +Porn + acc.porny,
            Sexy: +Sexy + acc.Sexy,
            Hentai: +Hentai + acc.Hentai,
            Natural: +Neutral + acc.Natural,
        }

    }, {
        porny: 0,
        Sexy: 0,
        Hentai: 0,
        Natural: 0
    })

    const id = crypto.randomBytes(8).toString('hex');
    console.log(`Item ${t} - done`);
    return { id, photos, rating };
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function selectePreview(imagearray) {

    return new Promise((resolve, reject) => {
        try {
            const classifiedImgs = imagearray.sort((a, b) => {
                if (a.one !== b.one) {
                    return a.probability.Porn - b.probability.Porn;
                }
                return b.probability.Sexy - a.probability.Sexy;
            });

            const preview = classifiedImgs[0];

            resolve(preview)

        } catch (error) {
            console.error(error);
        }
    })

}


function processPages() {
    console.log('Processing pages')
    getPages(i).then((d) => {
        i += 1;
        if (i === totalPages) {
            console.log('all page scraped')
            return process.exit();
        }

        processPages();
    }).catch((e) => {
        console.log(e)
    })
}

module.exports = processPages
// processPages();
