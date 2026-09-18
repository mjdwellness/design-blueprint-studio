# Azure deployment — setup

MJD's app moves from the Lovable preview to Azure Container Apps: a
container that runs the app as a real Node server, behind Azure's own HTTPS
ingress, autoscaling 1–3 instances. This is the checklist for turning that
on. The code and CI are already built (see below); provisioning the actual
Azure resources needs someone logged into MJD's Azure account — that can't
be scripted from here.

## What's already built and verified

- **`Dockerfile`** — multi-stage build: installs with Bun (matching this
  repo's committed `bun.lock`), builds the app, and copies only the built
  output into a small `node:22-slim` runtime image that runs
  `node .output/server/index.mjs`.
- **The Node server build itself was tested for real** — `vite.config.ts`
  now sets `nitro: { preset: "node-server" }`, and I built it and ran it in
  a sandbox here: it served the real app HTML and the `/.well-known/jwks.json`
  file correctly on port 8787. This doesn't touch Lovable's own hosted
  preview — see the comment in `vite.config.ts` for why (Lovable's build
  environment forces its own Cloudflare preset regardless of this setting).
- **`.github/workflows/azure-deploy.yml`** — on every push to `main` (or run
  manually from the Actions tab): builds the Docker image, pushes it to
  Azure Container Registry, and updates the Container App to the new image.
  Logs into Azure via OIDC (no stored password — see below).
- **`infra/azure-provision.sh`** — the one-time setup script for the Azure
  side (resource group, container registry, Container Apps environment, the
  Container App itself, and the GitHub Actions login identity). Idempotent —
  safe to re-run.

## What only someone with Azure/GitHub access can do

**1. Run the provisioning script once**, from a terminal logged into Azure
(`az login` first):

```
bash infra/azure-provision.sh
```

Open the script first and fill in the placeholders — resource names,
region, and (near the bottom) your GitHub org/repo name for the OIDC trust
relationship. It prints the values for the next step at the end.

**2. Add these to the GitHub repo's Actions secrets**
(Settings → Secrets and variables → Actions):

| Secret | Where it comes from |
|---|---|
| `AZURE_CLIENT_ID` | Printed by the provisioning script |
| `AZURE_TENANT_ID` | Printed by the provisioning script |
| `AZURE_SUBSCRIPTION_ID` | Printed by the provisioning script |
| `VITE_SUPABASE_URL` | Already in `.env` — not secret, just needed at build time |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Already in `.env` |
| `VITE_SUPABASE_PROJECT_ID` | Already in `.env` |

**3. Set the runtime secrets on the Container App itself** (not in GitHub —
these are server-only and never touch the image or the repo). The exact
commands are printed by the provisioning script; they set
`SUPABASE_SERVICE_ROLE_KEY` and, once Practice Fusion approves MJD's app,
the `PRACTICE_FUSION_*` values from `docs/practice-fusion-setup.md`.

**4. Push to `main`**, or open the Actions tab and run "Deploy to Azure"
manually. The workflow prints the live `*.azurecontainerapps.io` URL at the
end.

## Custom domain (optional, later)

Once the container app is live, a custom domain (e.g. `app.mjdwellness.org`)
can be attached to it in the Azure portal — DNS + a free managed TLS
certificate, no code changes needed. Worth doing before pointing the
desktop app at it permanently, so the URL doesn't need to change again.

## Desktop app

Unrelated to Azure mechanically, but the desktop app should eventually load
the Azure URL instead of the Lovable preview. `electron/main.cjs` now reads
that from an `APP_URL` environment variable at package time (falls back to
the current Lovable preview if unset), and
`.github/workflows/desktop-installers.yml` already has an `app_url` input
for exactly this — see `docs/desktop-app.md` for the rest of that workflow.
