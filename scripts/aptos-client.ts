import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import type { FormConfig, Form, Submission } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const MODULE_ADDRESS =
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
export const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const CHAIN_ID = 2;

// ---------------------------------------------------------------------------
// Internal Aptos SDK client (unauthenticated, for reads)
// ---------------------------------------------------------------------------
const config = new AptosConfig({
  network: Network.TESTNET,
  fullnode: NODE_URL,
});
export const aptosClient = new Aptos(config);

// ---------------------------------------------------------------------------
// Wallet adapter abstraction
// ---------------------------------------------------------------------------
// We store an optional wallet adapter so the UI layer can inject whichever
// adapter it wants (e.g. from @aptos-labs/wallet-adapter-react).  The adapter
// only needs to satisfy a tiny subset of the real interface.
interface MinimalWalletAdapter {
  account?: { address: string } | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (input: {
    data: {
      function: string;
      functionArguments: unknown[];
    };
    options?: {
      maxGasAmount?: number;
    };
  }) => Promise<{ hash: string }>;
}

let walletAdapter: MinimalWalletAdapter | null = null;

export function setWalletAdapter(adapter: MinimalWalletAdapter | null) {
  walletAdapter = adapter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSignerAddress(): string {
  if (!walletAdapter || !walletAdapter.account?.address) {
    throw new Error("Wallet not connected");
  }
  return walletAdapter.account.address;
}

async function submitEntryFunction(
  functionName: string,
  args: unknown[]
): Promise<{ hash: string }> {
  if (!walletAdapter) {
    throw new Error("Wallet not connected");
  }

  const response = await walletAdapter.signAndSubmitTransaction({
    data: {
      function: `${MODULE_ADDRESS}::shelby_form::${functionName}`,
      functionArguments: args,
    },
    options: {
      maxGasAmount: 20000,
    },
  });

  return response;
}

// ---------------------------------------------------------------------------
// Wallet lifecycle
// ---------------------------------------------------------------------------
export async function connectWallet(): Promise<string | null> {
  if (!walletAdapter) {
    return null;
  }
  await walletAdapter.connect();
  return walletAdapter.account?.address ?? null;
}

export function disconnectWallet(): void {
  walletAdapter?.disconnect().catch(() => {
    // silently ignore disconnect errors
  });
  walletAdapter = null;
}

// ---------------------------------------------------------------------------
// On-chain writes
// ---------------------------------------------------------------------------
export async function createForm(config: FormConfig): Promise<string> {
  const fieldsJson = JSON.stringify(config.fields);
  const settingsJson = JSON.stringify(config.settings);

  const result = await submitEntryFunction("create_form", [
    config.title,
    config.description ?? "",
    fieldsJson,
    settingsJson,
  ]);

  return result.hash;
}

export async function submitForm(
  formId: string,
  blobHash: string
): Promise<{ hash: string }> {
  return submitEntryFunction("submit_form", [formId, blobHash]);
}

export async function toggleFormActive(
  formId: string,
  active: boolean
): Promise<{ hash: string }> {
  return submitEntryFunction("toggle_form_active", [formId, active]);
}

// ---------------------------------------------------------------------------
// On-chain reads
// ---------------------------------------------------------------------------
export async function getForm(formId: string): Promise<Form | null> {
  try {
    const rows = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::shelby_form::get_form`,
        functionArguments: [formId],
      },
    });

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const raw = rows[0] as Record<string, unknown>;

    const fields: Form["config"]["fields"] = raw.fields_json
      ? JSON.parse(String(raw.fields_json))
      : [];
    const settings: Form["config"]["settings"] = raw.settings_json
      ? JSON.parse(String(raw.settings_json))
      : { honeypot: false, allowAnonymous: true };

    return {
      id: String(raw.id ?? formId),
      owner: String(raw.owner ?? "0x0"),
      config: {
        title: String(raw.title ?? ""),
        description: raw.description ? String(raw.description) : undefined,
        fields,
        settings,
      },
      active: Boolean(raw.active),
      submissionCount: Number(raw.submission_count ?? 0),
      createdAt: Number(raw.created_at ?? 0),
      updatedAt: Number(raw.updated_at ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getSubmissions(formId: string): Promise<Submission[]> {
  try {
    const rows = await aptosClient.view({
      payload: {
        function: `${MODULE_ADDRESS}::shelby_form::get_submissions`,
        functionArguments: [formId],
      },
    });

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const rawSubs = rows[0] as Record<string, unknown>[];
    if (!Array.isArray(rawSubs)) {
      return [];
    }

    return rawSubs.map((raw): Submission => {
      const data = raw.data_json
        ? (JSON.parse(String(raw.data_json)) as Record<string, string | string[]>)
        : undefined;
      return {
        id: String(raw.id ?? ""),
        formId: String(raw.form_id ?? formId),
        blobHash: String(raw.blob_hash ?? ""),
        submittedAt: Number(raw.submitted_at ?? 0),
        submitter: raw.submitter ? String(raw.submitter) : undefined,
        data,
      };
    });
  } catch {
    return [];
  }
}
