const core = require("@actions/core");
const request  = require('./httpClient');
const fs = require('fs');
const { spawnSync } = require("child_process");
const { exception } = require("console");

async function main() {
  try {

    // inputs from action
    const vaultUrl = core.getInput('vaultUrl', { required: true });
    const roleId = core.getInput('roleId', { required: true });
    const secretId = core.getInput('secretId', { required: true });
    const rolesetPath = core.getInput('rolesetPath', { required: true });
    const gcloudCommand = core.getInput('gcloudCommand', { required: true });
    const vaultAuthPayload = `{"role_id": "${roleId}", "secret_id": "${secretId}"}`;

    // authenticate to vault
    var vaultToken = await getVaultToken(vaultUrl, vaultAuthPayload);

    // activate service account
    var { keyValueDecoded, leaseId } = await getServiceAccount(vaultUrl, rolesetPath, vaultToken);

    // add service account private key json file to container 
    fs.writeFileSync('sa-key.json', keyValueDecoded, (error) => {
      if (error) throw error;
    });

    // auth to GCP with service account
    spawnSync('gcloud auth activate-service-account --key-file sa-key.json', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        throw error;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // execute provided command
    console.log(`Executing command: ${gcloudCommand}`);
    spawnSync(gcloudCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        throw error;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // release service account
    await revokeLease(vaultUrl, leaseId, vaultToken);

    // delete key json file
    fs.unlinkSync('sa-key.json', (error) => {
      if (error) throw error;
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getVaultToken(vaultUrl, vaultAuthPayload) {
  console.log(`Authenticating to vault`);
  const authResponse = await request(
    `${vaultUrl}/v1/auth/approle/login`,
    "POST",
    vaultAuthPayload,
    ""
  );

  var statusCode = authResponse.status;
  if (statusCode >= 400) {
    throw exception(`Failed to login via the provided approle with status code: ${statusCode}`);
  }

  var data = authResponse.data;
  return data.auth.client_token;
}

async function getServiceAccount(vaultUrl, rolesetPath, vaultToken) {
  console.log(`Activating service account`);
  const serviceAccountResponse = await request(
    `${vaultUrl}/v1/${rolesetPath}`,
    "GET",
    "",
    { 'X-Vault-Token': vaultToken }
  );

  var statusCode = serviceAccountResponse.status;
  if (statusCode >= 400) {
    throw exception(`Failed to access provided rolset path with status code: ${statusCode}`);
  }

  var saData = serviceAccountResponse.data;
  var keyValueDecoded = Buffer.from(saData.data.private_key_data, 'base64');
  var leaseId = saData.lease_id;
  return { keyValueDecoded, leaseId };
}

async function revokeLease(vaultUrl, leaseId, vaultToken) {
  console.log(`Revoking lease ${leaseId}`);
  const revokeResponse = await request(
    `${vaultUrl}/v1/sys/leases/revoke`,
    "PUT",
    `{"lease_id": "${leaseId}"}`,
    { 'X-Vault-Token': vaultToken }
  );

  var statusCode = revokeResponse.status;
  if (statusCode == 204) {
    console.log(`Successfully revoked lease: ${leaseId}`);
  }
  else {
    console.log(`Failed to revoke key with ${statusCode} on lease: ${leaseId}`);
  }
}

main();