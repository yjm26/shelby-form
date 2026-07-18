import { describe, it, expect } from "vitest";
import {
  FieldType,
  type FormField,
  type FormConfig,
  type Form,
  type Submission,
  type UploadResult,
  type FormBuilderState,
} from "../scripts/types";

describe("types", () => {
  it("FieldType has 9 values", () => {
    expect(Object.values(FieldType)).toHaveLength(9);
  });

  it("FormField has required fields", () => {
    const field: FormField = {
      id: "field_1",
      name: "full_name",
      label: "Full Name",
      type: FieldType.TEXT,
      required: true,
      order: 0,
    };
    expect(field.name).toBe("full_name");
    expect(field.required).toBe(true);
    expect(field.order).toBe(0);
  });

  it("FormField with SELECT has options", () => {
    const field: FormField = {
      id: "field_2",
      name: "country",
      label: "Country",
      type: FieldType.SELECT,
      required: false,
      order: 1,
      options: ["USA", "UK", "Japan"],
    };
    expect(field.options).toEqual(["USA", "UK", "Japan"]);
  });

  it("FormConfig has title and fields", () => {
    const config: FormConfig = {
      title: "Contact Form",
      description: "Get in touch",
      fields: [],
      settings: {
        honeypot: true,
        allowAnonymous: true,
      },
    };
    expect(config.title).toBe("Contact Form");
    expect(config.fields).toEqual([]);
  });

  it("Form has all required fields", () => {
    const form: Form = {
      id: "form_abc",
      owner: "0x1",
      config: {
        title: "Test",
        fields: [],
        settings: { honeypot: false, allowAnonymous: true },
      },
      active: true,
      submissionCount: 0,
      createdAt: 1750000000,
      updatedAt: 1750000000,
    };
    expect(form.id).toBe("form_abc");
    expect(form.active).toBe(true);
    expect(form.submissionCount).toBe(0);
  });

  it("Submission has required fields", () => {
    const sub: Submission = {
      id: "sub_1",
      formId: "form_abc",
      blobHash: "0xdeadbeef",
      submittedAt: 1750000000,
    };
    expect(sub.blobHash).toBe("0xdeadbeef");
    expect(sub.submitter).toBeUndefined();
  });

  it("UploadResult has hash and url", () => {
    const result: UploadResult = {
      hash: "0xabc123",
      url: "https://cdn.shelby.io/0xabc123",
    };
    expect(result.hash).toMatch(/^0x/);
    expect(result.url).toContain("shelby.io");
  });

  it("FormBuilderState has correct shape", () => {
    const state: FormBuilderState = {
      formConfig: {
        title: "Builder",
        fields: [],
        settings: { honeypot: true, allowAnonymous: false },
      },
      selectedFieldId: null,
      isDragging: false,
      draggedFieldId: null,
    };
    expect(state.isDragging).toBe(false);
  });
});
