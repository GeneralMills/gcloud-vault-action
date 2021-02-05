const axios = require('axios');
const https = require('https');

async function request(url, method, payload) {
  const config = {
    url,
    method,
    data: payload,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  };
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = request;