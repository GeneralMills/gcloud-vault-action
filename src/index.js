const core = require("@actions/core");
const request  = require('./httpClient');
const fs = require('fs');

async function main() {
  try {
    // inputs from action
    const vaultUrl = core.getInput('vaultUrl', { required: true });
    const roleId = core.getInput('roleId', { required: true });
    const secretId = core.getInput('secretId', { required: true });
    const rolesetPath = core.getInput('rolesetPath', { required: true });
    const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;

    // const vaultUrl = "https://vault.genmills.com:8200";
    // const roleId = "";
    // const secretId = "";
    // const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;

    // current time
    const time = new Date().toTimeString();

    // authenticate to vault
    const authResponse = await request(
      `${vaultUrl}/v1/auth/approle/login`,
      "POST",
      vaultAuthPayload,
      ""
    );

    var statusCode = authResponse.status;
    var data = authResponse.data;
    const vaultToken = data.auth.client_token;

    const serviceAccountResponse = await request(
    `${vaultUrl}/v1/${rolesetPath}`,
    "GET",
    "",
    { 'X-Vault-Token': vaultToken }
    );
    statusCode = serviceAccountResponse.status;
    data = serviceAccountResponse.data;

    // get private key from Vault response json body and decode base64 private key value
    // def keyValue = tokenJson.data.private_key_data
    // def keyValueDecoded = new String(keyValue.decodeBase64())
    // def slurper = new JsonSlurper()
    // def keyValueObject = slurper.parseText(keyValueDecoded)

    var privateKey = data.data.private_key_data;
    var keyValueDecoded = Buffer.from(privateKey, 'base64');
    console.log(keyValueDecoded.client_email);

    // const consoleOutputJSON = JSON.stringify(outputObject, undefined, 2);
    // console.log(consoleOutputJSON);

    // if (statusCode >= 400) {
    //   core.setFailed(`HTTP request failed with status code: ${statusCode}`);
    // } else {
    //   const outputJSON = JSON.stringify(outputObject);
    //   core.setOutput('output', outputJSON);
    // }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();