const serversList = require('../proxyservers');
let si = 0;
const getProxy = () => {
    si++;
    if (si === serversList.length) si = 0;
    const [host, port] = serversList[si].split(':');
    return { host, port };
  };

  module.exports = getProxy