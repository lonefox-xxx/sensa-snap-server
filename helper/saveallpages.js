const cheerio = require('cheerio');
const fs = require('fs');
const fetchDataWithRetry = require('../utils/fetchDataWithRetry');
const crypto = require('crypto');

const totalPages = 10
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
            const Data = {
                title,
                created: new Date().getTime(),
                ...photos
            }
            dataArray.push({ page, data: Data })
        }

        return true;
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        throw error;
    }
}

async function extractPhotos(link) {
    console.log(`Item ${t + 1} - started`);
    const { data } = await fetchDataWithRetry({ url: link });
    const $ = cheerio.load(data);

    const photos = [];

    await Promise.all(
        $('div.item').map(async (index, element) => {
            const imgSrc = $(element).find('img').attr('src');
            const id = crypto.randomBytes(16).toString('hex');
            photos.push({ id, src: imgSrc });
        }).get()
    );

    t += 1;

    const id = crypto.randomBytes(8).toString('hex');
    console.log(`Item ${t} - done`);
    return { id, photos, };
}


function processPages() {
    console.log('Processing pages')
    getPages(i).then((d) => {
        i += 1;
        if (i > totalPages) {
            console.log('all page scraped')
            fs.writeFileSync('./data.json', JSON.stringify(dataArray))
            return process.exit();
        }

        processPages();
    }).catch((e) => {
        console.log(e)
    })
}


processPages()