const { createClient } = require('redis');

const { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = process.env
const client = createClient({
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});


(async () => {
    try {
        const d = await client.connect()
    } catch (error) {
        console.log(error)
    }
})()

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.log(`Error: ${err}`);
});

module.exports = client;
