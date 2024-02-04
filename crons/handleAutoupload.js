const sleep = require('../utils/sleep')
const updatepots = require('./updatepots')

async function autoUpload() {
    const totoalUploads = 4
    const intervel = 1000 * 60 * 60 * 6

    for (let i = 0; i < totoalUploads; i++) {
        await sleep(intervel)
        await updatepots()
    }
}


function handleAutoUpload() {

    console.log('auto Uploading started...')

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = midnight - now;
    setTimeout(async () => {
        console.log("Today uploadings started...");
        await autoUpload()
        handleAutoUpload();
    }, timeUntilMidnight);

}

module.exports = handleAutoUpload;