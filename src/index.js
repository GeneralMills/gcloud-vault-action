const core = require("@actions/core");
const { request } = require('./httpClient');
const { GithubActions } = require('./githubActions');

async function main() {
  try {
    // inputs from action
    const vaultUrl = core.getInput('vaultUrl', { required: true });
    const roleId = core.getInput('roleId', { required: true });
    const secretId = core.getInput('secretId', { required: true });
    const rolesetPath = core.getInput('rolesetPath', { required: true });
    const vaultAuthPayload = `{
      "role_id": "${roleId}",
      "secret_id": "${secretId}"
    }`;
    console.log("test message");
    // current time
    const time = new Date().toTimeString();

    // authenticate to vault
    const response = await request(
      `${vaultUrl}/v1/auth/approle/login`,
      "POST",
      vaultAuthPayload,
    );

    const statusCode = response.status;
    const data = response.data;
    const outputObject = {
      url,
      method,
      payload,
      time,
      statusCode,
      data
    };

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