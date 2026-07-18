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

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: FieldValidation;
  order: number;
  settings?: Record<string, unknown>;
}

export interface FormSettings {
  honeypot: boolean;
  webhook?: string;
  emailNotification?: string;
  allowAnonymous: boolean;
  maxSubmissions?: number;
  expiresAt?: number;
  redirectUrl?: string;
  successMessage?: string;
}

export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
}

export interface Form {
  id: string;
  owner: string;
  config: FormConfig;
  active: boolean;
  submissionCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Submission {
  id: string;
  formId: string;
  blobHash: string;
  submittedAt: number;
  submitter?: string;
  data?: Record<string, string | string[]>;
}

export interface UploadResult {
  hash: string;
  url: string;
}

export interface FormBuilderState {
  formConfig: FormConfig;
  selectedFieldId: string | null;
  isDragging: boolean;
  draggedFieldId: string | null;
}
