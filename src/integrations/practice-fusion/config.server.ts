// Server-only configuration for the Practice Fusion FHIR connection.
// Nothing here is a secret by itself except PRACTICE_FUSION_PRIVATE_KEY —
// these are all read from environment variables set on the host (Lovable
// Cloud / wherever this app is deployed), never hardcoded and never sent to
// the client bundle. This file must only be imported from other *.server.ts
// modules or server functions.

export type PracticeFusionConfig = {
  clientId: string;
  privateKeyPem: string;
  /** Key id — must match the "kid" published in public/.well-known/jwks.json */
  keyId: string;
  tokenUrl: string;
  fhirBaseUrl: string;
  scope: string;
};

// Practice Fusion issues one Service Base URL per practice (downloaded as
// ServiceBaseURLs.json from the FHIR developer portal during app
// registration) — PRACTICE_FUSION_FHIR_BASE_URL is MJD's entry from that
// file, not a shared/global endpoint.
export function getPracticeFusionConfig(): PracticeFusionConfig {
  const clientId = process.env["PRACTICE_FUSION_CLIENT_ID"];
  const privateKeyPem = process.env["PRACTICE_FUSION_PRIVATE_KEY"];
  const keyId = process.env["PRACTICE_FUSION_KEY_ID"];
  const tokenUrl = process.env["PRACTICE_FUSION_TOKEN_URL"];
  const fhirBaseUrl = process.env["PRACTICE_FUSION_FHIR_BASE_URL"];
  // System/Bulk app type, read-only, patient demographics only — matches
  // "minimum-necessary access" already promised on the Integrations page.
  const scope = process.env["PRACTICE_FUSION_SCOPE"] ?? "system/Patient.read";

  const missing = [
    !clientId && "PRACTICE_FUSION_CLIENT_ID",
    !privateKeyPem && "PRACTICE_FUSION_PRIVATE_KEY",
    !keyId && "PRACTICE_FUSION_KEY_ID",
    !tokenUrl && "PRACTICE_FUSION_TOKEN_URL",
    !fhirBaseUrl && "PRACTICE_FUSION_FHIR_BASE_URL",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Practice Fusion is not configured yet. Missing environment variable(s): ${missing.join(", ")}. ` +
        `Set these once MJD's Practice Fusion FHIR app registration is approved.`,
    );
  }

  return { clientId: clientId!, privateKeyPem: privateKeyPem!, keyId: keyId!, tokenUrl: tokenUrl!, fhirBaseUrl: fhirBaseUrl!, scope };
}
