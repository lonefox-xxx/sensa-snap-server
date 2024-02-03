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
                    headers: { userAgent, ...headers },
                    data,
                    timeout,
                    ...params
                });
                resolve({ success: true, data: response.data });
                break;
            } catch (error) {
                retryCount++;
                timeout = Math.min(timeout * 2, 10000);
                e = error
            }
        }
        return resolve({ success: false, data: null, error: e.message });
    })
}

module.exports = fetchDataWithRetry;
