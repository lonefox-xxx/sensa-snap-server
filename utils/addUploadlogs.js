const Database = require("../database/database");
const db = new Database()

async function addUploadlogs(id, preview, title, teleURL, siteURL) {
    const sddres = await db.addLogs({ id, preview, title, teleURL, siteURL }, 'uploadLogs')
    console.log(sddres)
    return 'ok'
}

module.exports = addUploadlogs