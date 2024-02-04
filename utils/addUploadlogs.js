const Database = require("../database/database");
const db = new Database()

async function addUploadlogs(id, preview, title, teleURL, siteURL) {
    const sddres = await db.addLogs({ id, preview, title, teleURL, siteURL }, 'uploadLogs')
    return 'ok'
}

module.exports = addUploadlogs