const axios = require('axios');

async function request(url, method, payload, vaultCert) {
  const config = {
    url,
    method,
    data: payload,
    httpClient: new https.Agent({ ca: vaultCert })
  };
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = request;