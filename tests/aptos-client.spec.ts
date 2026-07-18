import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  FormConfig,
  Form,
  Submission,
  FormField,
  FieldType,
} from "../scripts/types";

// ---------------------------------------------------------------------------
// Mock @aptos-labs/ts-sdk before importing aptos-client
// ---------------------------------------------------------------------------
const mockView = vi.fn();

vi.mock("@aptos-labs/ts-sdk", async () => {
  const actual = await vi.importActual<typeof import("@aptos-labs/ts-sdk")>(
    "@aptos-labs/ts-sdk"
  );
  return {
    ...actual,
    Aptos: vi.fn().mockImplementation(() => ({
      view: mockView,
    })),
    AptosConfig: vi.fn(),
  };
});

// Import after mocks are set up
const {
  MODULE_ADDRESS,
  NODE_URL,
  CHAIN_ID,
  connectWallet,
  disconnectWallet,
  setWalletAdapter,
  createForm,
  submitForm,
  getForm,
  getSubmissions,
  toggleFormActive,
} = await import("../scripts/aptos-client");
void CHAIN_ID; void NODE_URL; void MODULE_ADDRESS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeField = (overrides: Partial<FormField> & { name: string; label: string }): FormField => ({
  id: overrides.id ?? `field_${overrides.name}`,
  name: overrides.name,
  label: overrides.label,
  type: overrides.type ?? ("text" as FieldType.TEXT),
  required: overrides.required ?? false,
  order: overrides.order ?? 0,
  placeholder: overrides.placeholder,
  helpText: overrides.helpText,
  options: overrides.options,
  validation: overrides.validation,
  settings: overrides.settings,
});

const makeConfig = (overrides: Partial<FormConfig> = {}): FormConfig => ({
  title: overrides.title ?? "Test Form",
  description: overrides.description,
  fields: overrides.fields ?? [makeField({ name: "name", label: "Name" })],
  settings: overrides.settings ?? {
    honeypot: false,
    allowAnonymous: true,
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("constants", () => {
  it("MODULE_ADDRESS is a valid hex address", () => {
    expect(MODULE_ADDRESS).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(MODULE_ADDRESS.length).toBeGreaterThan(2);
  });

  it("NODE_URL points to Aptos testnet", () => {
    expect(NODE_URL).toContain("testnet");
  });

  it("CHAIN_ID equals 2", () => {
    expect(CHAIN_ID).toBe(2);
  });
});

describe("wallet", () => {
  beforeEach(() => {
    disconnectWallet();
  });

  it("connectWallet returns null when no wallet adapter is set", async () => {
    const result = await connectWallet();
    expect(result).toBeNull();
  });

  it("connectWallet returns address after successful connection", async () => {
    const mockAdapter = {
      account: { address: "0xdeadbeef" },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signAndSubmitTransaction: vi.fn().mockResolvedValue({ hash: "0xabc" }),
    };
    setWalletAdapter(mockAdapter);
    const result = await connectWallet();
    expect(result).toBe("0xdeadbeef");
    expect(mockAdapter.connect).toHaveBeenCalledTimes(1);
  });

  it("disconnectWallet clears session", async () => {
    const mockAdapter = {
      account: { address: "0xdeadbeef" },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signAndSubmitTransaction: vi.fn().mockResolvedValue({ hash: "0xabc" }),
    };
    setWalletAdapter(mockAdapter);
    await connectWallet();
    disconnectWallet();
    const result = await connectWallet();
    expect(result).toBeNull();
  });
});

describe("createForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectWallet();
  });

  it("throws when wallet is not connected", async () => {
    await expect(createForm(makeConfig())).rejects.toThrow(
      "Wallet not connected"
    );
  });

  it("submits transaction and returns hash as formId", async () => {
    const mockAdapter = {
      account: { address: "0xowner" },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signAndSubmitTransaction: vi.fn().mockResolvedValue({
        hash: "0xtxhash",
      }),
    };
    setWalletAdapter(mockAdapter);
    await connectWallet();

    const config = makeConfig({ title: "My Form" });
    const formId = await createForm(config);

    expect(formId).toBe("0xtxhash");
    expect(mockAdapter.signAndSubmitTransaction).toHaveBeenCalledTimes(1);
    const callArg = mockAdapter.signAndSubmitTransaction.mock.calls[0][0];
    expect(callArg.data.function).toContain("create_form");
  });
});

describe("submitForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectWallet();
  });

  it("throws when wallet is not connected", async () => {
    await expect(submitForm("form_1", "0xhash")).rejects.toThrow(
      "Wallet not connected"
    );
  });

  it("submits a submission transaction", async () => {
    const mockAdapter = {
      account: { address: "0xsubmitter" },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signAndSubmitTransaction: vi.fn().mockResolvedValue({
        hash: "0xsubtx",
      }),
    };
    setWalletAdapter(mockAdapter);
    await connectWallet();

    const result = await submitForm("form_1", "0xblobhash");

    expect(result.hash).toBe("0xsubtx");
    expect(mockAdapter.signAndSubmitTransaction).toHaveBeenCalledTimes(1);
    const callArg = mockAdapter.signAndSubmitTransaction.mock.calls[0][0];
    expect(callArg.data.function).toContain("submit_form");
    expect(callArg.data.functionArguments).toEqual(["form_1", "0xblobhash"]);
  });
});

describe("getForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when view returns empty", async () => {
    mockView.mockResolvedValue([]);
    const result = await getForm("form_missing");
    expect(result).toBeNull();
  });

  it("returns a Form object from chain data", async () => {
    const chainForm = {
      id: "form_abc",
      owner: "0x1",
      title: "On-chain Form",
      description: "Desc",
      fields_json: JSON.stringify([
        {
          id: "f1",
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          order: 0,
        },
      ]),
      settings_json: JSON.stringify({ honeypot: true, allowAnonymous: false }),
      active: true,
      submission_count: "5",
      created_at: "1750000000",
      updated_at: "1750000001",
    };

    mockView.mockResolvedValue([chainForm]);

    const result = (await getForm("form_abc")) as Form;
    expect(result).not.toBeNull();
    expect(result.id).toBe("form_abc");
    expect(result.owner).toBe("0x1");
    expect(result.active).toBe(true);
    expect(result.submissionCount).toBe(5);
    expect(result.config.title).toBe("On-chain Form");
    expect(result.config.fields).toHaveLength(1);
    expect(result.config.fields[0].name).toBe("email");
    expect(result.config.settings.honeypot).toBe(true);
  });

  it("handles view function error gracefully", async () => {
    mockView.mockRejectedValue(new Error("Form not found"));
    const result = await getForm("form_err");
    expect(result).toBeNull();
  });
});

describe("getSubmissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when view returns empty", async () => {
    mockView.mockResolvedValue([]);
    const result = await getSubmissions("form_empty");
    expect(result).toEqual([]);
  });

  it("returns Submission objects from chain data", async () => {
    const chainSubs = [
      {
        id: "sub_1",
        form_id: "form_x",
        blob_hash: "0xaaa",
        submitted_at: "1750000000",
        submitter: "0xuser1",
        data_json: JSON.stringify({ name: ["Alice"] }),
      },
      {
        id: "sub_2",
        form_id: "form_x",
        blob_hash: "0xbbb",
        submitted_at: "1750000001",
        submitter: null,
        data_json: null,
      },
    ];

    mockView.mockResolvedValue([chainSubs]);

    const result = (await getSubmissions("form_x")) as Submission[];
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("sub_1");
    expect(result[0].blobHash).toBe("0xaaa");
    expect(result[0].submitter).toBe("0xuser1");
    expect(result[0].data).toEqual({ name: ["Alice"] });
    expect(result[1].submitter).toBeUndefined();
    expect(result[1].data).toBeUndefined();
  });

  it("handles view function error gracefully", async () => {
    mockView.mockRejectedValue(new Error("Network error"));
    const result = await getSubmissions("form_err");
    expect(result).toEqual([]);
  });
});

describe("toggleFormActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectWallet();
  });

  it("throws when wallet is not connected", async () => {
    await expect(toggleFormActive("form_1", false)).rejects.toThrow(
      "Wallet not connected"
    );
  });

  it("submits toggle transaction", async () => {
    const mockAdapter = {
      account: { address: "0xowner" },
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      signAndSubmitTransaction: vi.fn().mockResolvedValue({
        hash: "0xtoggle",
      }),
    };
    setWalletAdapter(mockAdapter);
    await connectWallet();

    const result = await toggleFormActive("form_1", false);

    expect(result.hash).toBe("0xtoggle");
    expect(mockAdapter.signAndSubmitTransaction).toHaveBeenCalledTimes(1);
    const callArg = mockAdapter.signAndSubmitTransaction.mock.calls[0][0];
    expect(callArg.data.function).toContain("toggle_form_active");
    expect(callArg.data.functionArguments).toEqual(["form_1", false]);
  });
});
