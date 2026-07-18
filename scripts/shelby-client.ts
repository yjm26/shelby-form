import { ShelbyClient } from "@shelby-protocol/sdk";
import type { UploadResult } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const SHELBY_BASE_URL = "https://api.testnet.shelbyprotocol.com";

// ---------------------------------------------------------------------------
// Internal client (lazy init)
// ---------------------------------------------------------------------------
let client: ShelbyClient | null = null;

function getClient(): ShelbyClient {
  if (!client) {
    client = new ShelbyClient({
      baseUrl: SHELBY_BASE_URL,
      network: "testnet",
    });
  }
  return client;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Upload form data as JSON blob. Returns hash. Anonymous — no wallet required. */
export async function uploadFormData(
  data: Record<string, unknown>,
  formId: string
): Promise<UploadResult> {
  const payload = JSON.stringify({
    ...data,
    _meta: {
      formId,
      submittedAt: Date.now(),
      version: "1.0",
    },
  });

  try {
    const result = await getClient().upload(
      new Blob([payload], { type: "application/json" }),
      { tags: [formId] }
    );
    return result;
  } catch (err) {
    throw new Error(
      `Failed to upload form data: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/** Download a submission blob by hash and parse JSON. */
export async function downloadSubmissionBlob(
  hash: string
): Promise<Record<string, unknown>> {
  try {
    const blob = await getClient().download(hash);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Failed to download blob: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/** List all submission blobs for a given formId. */
export async function listFormSubmissions(
  formId: string
): Promise<UploadResult[]> {
  try {
    const items = await getClient().list({ tag: formId });
    return items.map((item: Record<string, unknown>) => ({
      hash: String(item.hash ?? ""),
      url: String(item.url ?? ""),
    }));
  } catch {
    return [];
  }
}
