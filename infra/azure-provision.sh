#!/usr/bin/env bash
# One-time Azure setup for MJD Wellness. Run this yourself from a terminal
# logged into Azure (`az login`) — it can't run from here, since it needs
# your Azure account. Safe to re-run: every command is idempotent
# (`az ... create` no-ops if the resource already exists).
#
# What this creates:
#   1. A resource group
#   2. An Azure Container Registry (ACR) to hold the app's Docker image
#   3. A Log Analytics workspace + Container Apps environment
#   4. The Container App itself, seeded with a placeholder image (the
#      GitHub Actions workflow replaces it with the real build on push)
#   5. A service principal scoped to the resource group, for GitHub Actions
#      to log in as — paste its output into the AZURE_CREDENTIALS secret
#      (see docs/azure-deployment.md)
#
# Edit the variables below first, then: bash infra/azure-provision.sh

set -euo pipefail

RESOURCE_GROUP="mjd-wellness-rg"
LOCATION="eastus"                       # az account list-locations -o table
ACR_NAME="mjdwellnessacr"               # must be globally unique, alphanumeric only
CONTAINERAPPS_ENV="mjd-wellness-env"
CONTAINER_APP_NAME="mjd-wellness-app"
LOG_ANALYTICS_NAME="mjd-wellness-logs"

echo "==> Resource group: $RESOURCE_GROUP ($LOCATION)"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "==> Container registry: $ACR_NAME"
az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic --admin-enabled false --output none

echo "==> Log Analytics workspace: $LOG_ANALYTICS_NAME"
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS_NAME" \
  --output none

LOG_ANALYTICS_CLIENT_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" --workspace-name "$LOG_ANALYTICS_NAME" \
  --query customerId -o tsv)
LOG_ANALYTICS_CLIENT_SECRET=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group "$RESOURCE_GROUP" --workspace-name "$LOG_ANALYTICS_NAME" \
  --query primarySharedKey -o tsv)

echo "==> Container Apps environment: $CONTAINERAPPS_ENV"
az extension add --name containerapp --upgrade --output none 2>/dev/null || true
az provider register --namespace Microsoft.App --wait --output none
az provider register --namespace Microsoft.OperationalInsights --wait --output none

az containerapp env create \
  --name "$CONTAINERAPPS_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --logs-workspace-id "$LOG_ANALYTICS_CLIENT_ID" \
  --logs-workspace-key "$LOG_ANALYTICS_CLIENT_SECRET" \
  --output none

echo "==> Container App: $CONTAINER_APP_NAME (placeholder image — GitHub Actions replaces this)"
az containerapp create \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENV" \
  --image mcr.microsoft.com/k8se/quickstart:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 --memory 1.0Gi \
  --output none

echo "==> Granting the Container App pull access to the registry"
ACR_ID=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query id -o tsv)
IDENTITY_ID=$(az containerapp identity assign \
  --name "$CONTAINER_APP_NAME" --resource-group "$RESOURCE_GROUP" \
  --system-assigned --query principalId -o tsv)
az role assignment create \
  --assignee "$IDENTITY_ID" \
  --scope "$ACR_ID" \
  --role AcrPull \
  --output none
az containerapp registry set \
  --name "$CONTAINER_APP_NAME" --resource-group "$RESOURCE_GROUP" \
  --server "$ACR_NAME.azurecr.io" \
  --identity system \
  --output none

echo "==> Runtime secrets — these are NOT committed anywhere; fill in real values"
echo "    (re-run this az command later to rotate any of them)"
cat <<'EOF'

az containerapp secret set \
  --name mjd-wellness-app --resource-group mjd-wellness-rg \
  --secrets \
    supabase-url="<from .env: SUPABASE_URL>" \
    supabase-service-role-key="<Supabase Studio > Settings > API > service_role key>" \
    supabase-publishable-key="<from .env: SUPABASE_PUBLISHABLE_KEY>" \
    practice-fusion-client-id="<once Practice Fusion approves the app>" \
    practice-fusion-private-key="<the private key sent to you separately — never commit it>" \
    practice-fusion-key-id="CMa3eszTnBxXlYbL" \
    practice-fusion-token-url="<Practice Fusion's token endpoint>" \
    practice-fusion-fhir-base-url="<MJD's Service Base URL from ServiceBaseURLs.json>"

az containerapp update \
  --name mjd-wellness-app --resource-group mjd-wellness-rg \
  --set-env-vars \
    SUPABASE_URL=secretref:supabase-url \
    SUPABASE_SERVICE_ROLE_KEY=secretref:supabase-service-role-key \
    SUPABASE_PUBLISHABLE_KEY=secretref:supabase-publishable-key \
    PRACTICE_FUSION_CLIENT_ID=secretref:practice-fusion-client-id \
    PRACTICE_FUSION_PRIVATE_KEY=secretref:practice-fusion-private-key \
    PRACTICE_FUSION_KEY_ID=secretref:practice-fusion-key-id \
    PRACTICE_FUSION_TOKEN_URL=secretref:practice-fusion-token-url \
    PRACTICE_FUSION_FHIR_BASE_URL=secretref:practice-fusion-fhir-base-url
EOF

echo
echo "==> GitHub Actions identity (OpenID Connect — no stored password)"
echo "    Fill these in before running this part:"
GITHUB_ORG="your-github-org-or-username"
GITHUB_REPO="design-blueprint-studio"
GITHUB_BRANCH="main"

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

APP_ID=$(az ad app create --display-name "mjd-wellness-gha" --query appId -o tsv)
az ad sp create --id "$APP_ID" --output none

az role assignment create \
  --assignee "$APP_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --output none

# Trusts GitHub Actions runs specifically from this repo's main branch —
# nothing else can authenticate as this identity. Add another
# federated-credential with a different --subject for other branches/PRs.
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters "{
    \"name\": \"mjd-wellness-main\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/${GITHUB_BRANCH}\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"

echo
echo "Done. In the GitHub repo, add these three Actions secrets:"
echo "  AZURE_CLIENT_ID       = $APP_ID"
echo "  AZURE_TENANT_ID       = $TENANT_ID"
echo "  AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
echo
echo "Then fill in and run the az containerapp secret/env commands above,"
echo "and push to main (or run the 'Deploy to Azure' workflow manually)."
