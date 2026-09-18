// Talks to Practice Fusion's FHIR R4 API using the SMART Backend Services
// (system-to-system) flow: a JWT signed with our private key stands in for
// a client secret, so MJD's practice can be synced without any user
// clicking through an OAuth consent screen. Server-only — never import this
// from a route/component file.
import { createSign, randomUUID } from "node:crypto";
import type { PracticeFusionConfig } from "./config.server";

function base64url(input: Buffer | string): string {
  return Buffer.from(input as any).toString("base64url");
}

// Builds the client_assertion JWT per the SMART App Launch Backend Services
// spec: iss/sub = our client_id, aud = the token endpoint, short-lived,
// signed RS384 with the private key whose public half is published at
// /.well-known/jwks.json (matched by "kid").
function signBackendServicesAssertion(config: PracticeFusionConfig): string {
  const header = { alg: "RS384", typ: "JWT", kid: config.keyId };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: config.clientId,
    sub: config.clientId,
    aud: config.tokenUrl,
    iat: now,
    exp: now + 300,
    jti: randomUUID(),
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA384");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(config.privateKeyPem);
  return `${signingInput}.${base64url(signature)}`;
}

async function getAccessToken(config: PracticeFusionConfig): Promise<string> {
  const assertion = signBackendServicesAssertion(config);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: assertion,
    scope: config.scope,
  });
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Practice Fusion token request failed (${res.status}): ${text.slice(0, 500)}`);
  }
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

type FhirHumanName = { use?: string; family?: string; given?: string[] };
type FhirContactPoint = { system?: string; value?: string };
type FhirAddress = { line?: string[]; city?: string; state?: string; postalCode?: string };
type FhirPatientResource = {
  resourceType: "Patient";
  id: string;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  address?: FhirAddress[];
  birthDate?: string;
};
type FhirBundle = {
  entry?: Array<{ resource?: { resourceType: string } & Record<string, unknown> }>;
  link?: Array<{ relation: string; url: string }>;
};

export type PracticeFusionPatient = {
  fhirId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

function mapFhirPatient(resource: FhirPatientResource): PracticeFusionPatient {
  const name = resource.name?.find((n) => n.use === "official") ?? resource.name?.[0];
  const phone = resource.telecom?.find((t) => t.system === "phone")?.value ?? null;
  const email = resource.telecom?.find((t) => t.system === "email")?.value ?? null;
  const addr = resource.address?.[0];
  const address = addr ? [addr.line?.join(" "), addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ") : null;
  return {
    fhirId: resource.id,
    firstName: name?.given?.[0] ?? "Unknown",
    lastName: name?.family ?? "Patient",
    dateOfBirth: resource.birthDate ?? null,
    phone,
    email,
    address: address || null,
  };
}

// Practice Fusion's FHIR API is read-only for third-party integrators —
// there's no write-back here, by design (matches "Read from EHR; write-back
// disabled" already promised on the org Integrations page).
export async function fetchPracticeFusionPatients(config: PracticeFusionConfig): Promise<PracticeFusionPatient[]> {
  const accessToken = await getAccessToken(config);
  const patients: PracticeFusionPatient[] = [];
  let url: string | null = `${config.fhirBaseUrl.replace(/\/$/, "")}/Patient?_count=100`;
  let pages = 0;
  const MAX_PAGES = 500; // guardrail so a misbehaving pagination loop can't run forever

  while (url && pages < MAX_PAGES) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/fhir+json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Practice Fusion Patient fetch failed (${res.status}): ${text.slice(0, 500)}`);
    }
    const bundle = (await res.json()) as FhirBundle;
    for (const entry of bundle.entry ?? []) {
      if (entry.resource?.resourceType === "Patient") patients.push(mapFhirPatient(entry.resource as FhirPatientResource));
    }
    url = bundle.link?.find((l) => l.relation === "next")?.url ?? null;
    pages += 1;
  }
  return patients;
}
