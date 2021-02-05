const core = require("@actions/core");
const request  = require('./httpClient');
const fs = require('fs');

async function main() {
  try {
    // inputs from action
    // const vaultUrl = core.getInput('vaultUrl', { required: true });
    // const roleId = core.getInput('roleId', { required: true });
    // const secretId = core.getInput('secretId', { required: true });
    // const rolesetPath = core.getInput('rolesetPath', { required: true });
    // const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;

    const vaultUrl = "https://vault.genmills.com:8200";
    const roleId = "";
    const secretId = "";
    const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;


    console.log("test message");
    // current time
    const time = new Date().toTimeString();

    // authenticate to vault
    const authResponse = await request(
      `${vaultUrl}/v1/auth/approle/login`,
      "POST",
      vaultAuthPayload,
    );

    const statusCode = authResponse.status;
    const data = authResponse.data;
    const outputObject = {
      url,
      method,
      payload,
      time,
      statusCode,
      data
    };

    // def tokenJSON = readJSON text: result.content
    // // vault token used for future vault calls
    // env.VAULT_TOKEN = tokenJSON.auth.client_token

    //     // get GCP Service Account private key from Vault
    // def tokenResult = httpRequest acceptType: 'APPLICATION_JSON',
    //                         responseHandle: 'STRING',
    //                         customHeaders: [[maskValue: true, name: 'X-Vault-Token', value: env.VAULT_TOKEN]],
    //                         httpMode: 'GET',
    //                         url: "$VAULT_URL/v1/$DEV_ROLESET_PATH",
    //                         consoleLogResponseBody: false
    // def tokenJson = readJSON text: tokenResult.content

    //const serviceAccountResponse = await request(
    // `${vaultUrl}/v1/${rolesetPath}`,
    // "GET",
    // `{maskValue: true, name: 'X-Vault-Token', value: VAULT_TOKEN}
    // );

    const consoleOutputJSON = JSON.stringify(outputObject, undefined, 2);
    console.log(consoleOutputJSON);

    if (statusCode >= 400) {
      core.setFailed(`HTTP request failed with status code: ${statusCode}`);
    } else {
      const outputJSON = JSON.stringify(outputObject);
      core.setOutput('output', outputJSON);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();