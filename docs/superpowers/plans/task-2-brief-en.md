# Task 2 Brief: Shared Types & Constants (ENGLISH)

## Requirements

All code in **ENGLISH**. No Indonesian variable/class names.

### Types to create in `scripts/types.ts`

```typescript
export enum FieldType {
  TEXT = "text",
  EMAIL = "email",
  TEXTAREA = "textarea",
  NUMBER = "number",
  SELECT = "select",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  DATE = "date",
  FILE = "file",
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];       // for SELECT, RADIO, CHECKBOX
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  order: number;
}

export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
  settings?: {
    honeypot: boolean;
    webhook?: string;
    emailNotification?: string;
    allowAnonymous: boolean;
    maxSubmissions?: number;
    expiresAt?: number;
  };
}

export interface Form {
  id: string;
  owner: string;           // Aptos address
  config: FormConfig;
  active: boolean;
  submissionCount: number;
  createdAt: number;       // timestamp
  updatedAt: number;
}

export interface Submission {
  id: string;
  formId: string;
  blobHash: string;        // Shelby blob reference
  submittedAt: number;
  submitter?: string;      // optional wallet address
  data?: Record<string, string | string[]>;  // parsed form data
}

export interface UploadResult {
  hash: string;
  url: string;
}
```

### Test file: `tests/types.spec.ts`

Test cases:
1. FieldType has 9 values
2. FormField requires id, name, label, type, required, order
3. FormConfig requires title and fields array
4. Form requires id, owner, config, active, submissionCount, createdAt, updatedAt
5. Submission requires id, formId, blobHash, submittedAt
6. UploadResult has hash and url

### Rules
- TDD: Write test FIRST → verify FAIL → implement → verify PASS
- Export ALL types from `scripts/types.ts`
- English ONLY. No Indonesian names.
- Commit after tests pass
