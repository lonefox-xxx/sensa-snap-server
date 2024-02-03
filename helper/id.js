const fs = require('fs');
const client = require('../database/redis');
const data = JSON.parse(fs.readFileSync('./resdata.json', 'utf-8'))
const ids = []

function saveIds() {

    data.forEach(element => {
        const { data: { id } } = element
        ids.push(id)
    });

    client.set('ids', JSON.stringify(ids)).then((d) =>
        console.log(d)
    )
}

module.exports = saveIds