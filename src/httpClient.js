const axios = require('axios');
const https = require('https');

async function request(url, method, payload, vaultCert) {
  const config = {
    url,
    method,
    data: payload,
    httpClient: new https.Agent({ ca: vaultCert })
  };
  console.log("test " + config.httpClient.options);
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = request;