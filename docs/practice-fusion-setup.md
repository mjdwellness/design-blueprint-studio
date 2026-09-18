# Practice Fusion connection — setup

MJD's patient demographics are meant to be sourced from Practice Fusion, the
practice's system of record. This document is the setup checklist for
turning that on. The code side is already built (see "What's already
built" below); everything else here is external and has to be done by
someone at MJD Wellness — a partner registration and production secrets, not
something that can be scripted.

## Which Practice Fusion API, and why

Practice Fusion exposes two read-only third-party APIs. Neither supports
appointments/scheduling or any write-back — this was confirmed directly
against Practice Fusion's own documentation, not assumed:

- **PDS API** (Patient Data Sharing) — built for one-patient-at-a-time
  lookups (search by name + DOB, then pull that one patient's CCDA). Good
  fit for a patient-portal "link my record" flow, not for syncing an
  organization's whole panel.
- **FHIR API** (R4, US Core, SMART App Launch v2, Bulk Data v1) — supports a
  **System/Bulk** app type meant for exactly this: a backend service pulling
  every patient for a practice, no per-user login. This is what MJD needs,
  so this is what's built.

Auth is OAuth 2.0 **client_credentials** with a signed-JWT client assertion
(SMART Backend Services) — no username/password, no OAuth consent screen,
because there's no end user in the loop. Scope requested: `system/Patient.read`
(demographics only — name, DOB, phone, email, address — matching the "Planned
scope" already promised on the Integrations page, minus appointments, which
Practice Fusion simply doesn't expose).

## What's already built

- `supabase/migrations/20260917212008_ehr_connections.sql` — an
  `ehr_connections` table (one row per organization + provider) tracking
  connection status, last sync time, and last error. RLS: org members can
  read it, org admins can manage it. Also adds a unique index so patient
  records can be matched idempotently by `(organization_id, ehr_reference)`.
- `src/integrations/practice-fusion/config.server.ts` — reads the
  credentials below from environment variables. Throws a clear error
  listing exactly what's missing if the connection isn't configured yet.
- `src/integrations/practice-fusion/client.server.ts` — signs the JWT client
  assertion, exchanges it for an access token, and pages through
  `GET /Patient` on Practice Fusion's FHIR API for MJD's practice.
- `src/integrations/practice-fusion/sync.server.ts` — a server function that
  checks the caller is MJD's org admin (or the platform super_admin), then
  upserts every patient it gets back into the `patients` table (matched by
  Practice Fusion's patient id, stored in the existing `ehr_reference`
  column) and updates `ehr_connections`.
- `public/.well-known/jwks.json` — publishes the **public** half of a
  keypair generated for this integration, for Practice Fusion to verify the
  signed JWTs against. (The private half never goes in this repo — see
  below.)
- The organization-level Integrations page (`src/routes/integrations.tsx`)
  now reads real connection status instead of a static "Setup required"
  placeholder, and has a "Connect & sync" / "Sync now" button that calls the
  sync function directly — there's nothing else to click through, since
  there's no OAuth consent step for a system app.

## What only MJD can do

**1. Register the FHIR app with Practice Fusion.**
Start at the FHIR developer portal: <https://www.practicefusion.com/fhir/get-started/>.
This requires MJD's own business details and agreement to Practice Fusion's
terms of service, so it has to be submitted by someone at MJD, not by me.
When registering, use:

- **App type:** System / Bulk export
- **JWKS URL:** `https://<mjd-domain>/.well-known/jwks.json` (already live at
  that path once this is deployed — it's a static file, nothing to
  configure)
- **Requested scope:** `system/Patient.read`
- **Grant type:** client_credentials (backend services / asymmetric)

Practice Fusion's approval isn't instant — there's a partner registration
review, and Practice Fusion also publishes a per-practice **Service Base
URL** (a `ServiceBaseURLs.json` file) that identifies MJD's specific FHIR
endpoint once approved.

**2. Set these environment variables** wherever the app is deployed (ask
whoever manages the Lovable Cloud / hosting environment variables — same
place `SUPABASE_SERVICE_ROLE_KEY` already lives):

| Variable | Value |
|---|---|
| `PRACTICE_FUSION_CLIENT_ID` | The client ID Practice Fusion issues on approval |
| `PRACTICE_FUSION_PRIVATE_KEY` | The private key (sent separately — see below). **Never commit this.** |
| `PRACTICE_FUSION_KEY_ID` | `CMa3eszTnBxXlYbL` — must match the `kid` in `public/.well-known/jwks.json` |
| `PRACTICE_FUSION_TOKEN_URL` | Practice Fusion's OAuth token endpoint (from their docs / approval email) |
| `PRACTICE_FUSION_FHIR_BASE_URL` | MJD's Service Base URL from `ServiceBaseURLs.json` |
| `PRACTICE_FUSION_SCOPE` | `system/Patient.read` (optional — this is already the default) |

**3. Apply the database migration** — `supabase db push` from a terminal
that's logged into MJD's Supabase project, or paste
`supabase/migrations/20260917212008_ehr_connections.sql` into the Supabase
Studio SQL editor and run it. Without this the `ehr_connections` table
doesn't exist yet and the Integrations page will error.

## Once that's done

Nothing else to build — sign in as MJD's org admin (or as super_admin),
open Integrations, and click "Connect & sync." If the environment variables
above are missing or wrong, the button will show a specific error (which
variable is missing, or the exact Practice Fusion API error) instead of a
silent failure.
