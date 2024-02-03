const { default: axios } = require("axios");
const UserAgent = require("user-agents");

function fetchDataWithRetry({ url, maxRetries = 3, initialTimeout = 5000, data = {}, headers = {}, method = 'get', params = {} }) {
    const userAgent = new UserAgent().toString();
    return new Promise(async (resolve, reject) => {
        let retryCount = 0;
        let timeout = initialTimeout;
        let e;
        while (retryCount < maxRetries) {
            try {
                const response = await axios[method.toLowerCase()](url, {
                    method: method,
                    headers: {
                        userAgent,
                        ...headers
                    },
                    data,
                    // proxy: {
                    //     host: 'proxy-server.scraperapi.com',
                    //     port: 8001,
                    //     auth: {
                    //         username: 'scraperapi',
                    //         password: '61e8b8912849e154d57583fd2e274a7d'
                    //     },
                    //     protocol: 'http'
                    // },
                    timeout,
                    ...params
                });
                resolve({ success: true, data: response.data });  // Fixed typo here (success instead of succes)
                break;
            } catch (error) {
                retryCount++;
                timeout = Math.min(timeout * 2, 10000);
                e = error
            }
        }

        return resolve({ success: false, data: null, error: e });  // Fixed typo here (success instead of succes)
    })
}

module.exports = fetchDataWithRetry;
