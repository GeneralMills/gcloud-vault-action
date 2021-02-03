const axios = require('axios');

async function request(url, method, payload) {
  const config = {
    url,
    method,
    data: payload
  };
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = request;