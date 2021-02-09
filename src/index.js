const core = require("@actions/core");
const request  = require('./httpClient');
const fs = require('fs');
const { exec } = require("child_process");

async function main() {
  // inputs from action
  const vaultUrl = core.getInput('vaultUrl', { required: true });
  const roleId = core.getInput('roleId', { required: true });
  const secretId = core.getInput('secretId', { required: true });
  const rolesetPath = core.getInput('rolesetPath', { required: true });
  const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;
  const gcloudCommand = core.getInput('gcloudCommand', { required: true });

  try {
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

    var privateKey = data.data.private_key_data;
    var keyValueDecoded = Buffer.from(privateKey, 'base64');
    // var clientEmail = JSON.parse(keyValueDecoded.toString()).client_email;
    const leaseId = data.lease_id;

    // add service account private key json file to container 
    fs.writeFileSync('sa-key.json', keyValueDecoded, (err) => {
      if (err) throw err;
    });

    exec('test -f sa-key.json && echo "$FILE exists."', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // auth to GCP with service account
    exec('gcloud auth activate-service-account --key-file sa-key.json', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    exec(gcloudCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    const revokeResponse = await request(
      `${vaultUrl}/v1/sys/leases/revoke`,
      "PUT",
      `{"lease_id": "${leaseId}"}`,
      {'X-Vault-Token': vaultToken}
    );

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();