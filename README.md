# gcloud-vault-action

A GitHub Action to authenticate to gcloud via Vault and then execute a provided command.
This method will take a Vault credential, authenticate to Vault, and get a private SA key from Vault using the provided GCP roleset. It will then will execute the provided command with that credential authenticated in the gcloud SDK. After the closure has been run, the lease on the private SA key in GCP will be revoked using the Vault GCP roleset.

## Inputs

| Parameter       | Required | Info                                         |
| --------------- | -------- | -------------------------------------------- |
| `vaultUrl`      | `true`   | Vault URL                                    |
| `roleId`        | `true`   | RoleId to authenticate to vault with         |
| `secretId`      | `true`   | SecretId associated with the role provided   |
| `rolesetPath`   | `true`   | Path to GCP roleset in vault                 |
| `command`       | `true`   | gcloud command(s) to run                     |

## Example

```yaml
uses: GeneralMills/gcloud-vault-action
    with:
    vaultUrl: ${{ env.VAULT_URL }}
    roleId: ${{ secrets.ROLE_ID }}
    secretId: ${{ secrets.SECRET_ID }}
    rolesetPath: ${{ env.ROLESET_PATH }}
    command: |
        gcloud auth configure-docker gcr.io
```

`command` can execute multiple commands as well.
