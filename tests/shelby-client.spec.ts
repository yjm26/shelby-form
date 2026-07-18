import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UploadResult } from "../scripts/types";

const mockUpload = vi.fn();
const mockDownload = vi.fn();
const mockList = vi.fn();

vi.mock("@shelby-protocol/sdk", async () => {
  return {
    ShelbyClient: vi.fn().mockImplementation(() => ({
      upload: mockUpload,
      download: mockDownload,
      list: mockList,
    })),
  };
});

const {
  uploadFormData,
  downloadSubmissionBlob,
  listFormSubmissions,
  SHELBY_BASE_URL,
} = await import("../scripts/shelby-client");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("constants", () => {
  it("SHELBY_BASE_URL points to testnet", () => {
    expect(SHELBY_BASE_URL).toContain("testnet");
  });
});

describe("uploadFormData", () => {
  it("uploads JSON blob and returns hash", async () => {
    const mockResult: UploadResult = {
      hash: "0xblobhash123",
      url: "https://cdn.testnet.shelby.io/0xblobhash123",
    };
    mockUpload.mockResolvedValue(mockResult);

    const data = { formId: "form_1", fields: { name: "Alice" } };
    const result = await uploadFormData(data, "form_1");

    expect(result.hash).toBe("0xblobhash123");
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const callArgs = mockUpload.mock.calls[0][0];
    expect(callArgs).toBeInstanceOf(Blob);
  });

  it("throws on upload failure", async () => {
    mockUpload.mockRejectedValue(new Error("Network error"));

    const data = { formId: "form_1", fields: {} };
    await expect(uploadFormData(data, "form_1")).rejects.toThrow("Failed to upload form data");
  });
});

describe("downloadSubmissionBlob", () => {
  it("downloads blob by hash and returns parsed JSON", async () => {
    const mockData = { name: "Alice", email: "alice@test.com" };
    mockDownload.mockResolvedValue(
      new Blob([JSON.stringify(mockData)], { type: "application/json" })
    );

    const result = await downloadSubmissionBlob("0xblobhash");
    expect(result).toEqual(mockData);
    expect(mockDownload).toHaveBeenCalledWith("0xblobhash");
  });

  it("throws on download failure", async () => {
    mockDownload.mockRejectedValue(new Error("Blob not found"));
    await expect(downloadSubmissionBlob("0xmissing")).rejects.toThrow("Failed to download blob");
  });
});

describe("listFormSubmissions", () => {
  it("lists submissions for a formId", async () => {
    const mockItems = [
      { hash: "0xaaa", url: "https://cdn.testnet.shelby.io/0xaaa", submittedAt: 1750000000 },
      { hash: "0xbbb", url: "https://cdn.testnet.shelby.io/0xbbb", submittedAt: 1750000001 },
    ];
    mockList.mockResolvedValue(mockItems);

    const result = await listFormSubmissions("form_1");
    expect(result).toHaveLength(2);
    expect(result[0].hash).toBe("0xaaa");
    expect(mockList).toHaveBeenCalledWith({ tag: "form_1" });
  });

  it("returns empty array when no submissions", async () => {
    mockList.mockResolvedValue([]);
    const result = await listFormSubmissions("form_empty");
    expect(result).toEqual([]);
  });
});
