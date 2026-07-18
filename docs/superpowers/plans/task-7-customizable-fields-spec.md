# Task 7: Form Builder - Fully Customizable Fields Spec

## Customizable Features (Owner can configure)

### Field Types (9 types)
| Type | Input | Configurable Properties |
|---|---|---|
| **TEXT** | Single line text | placeholder, validation (min/max length, regex) |
| **EMAIL** | Email input | placeholder, validation (regex) |
| **TEXTAREA** | Multi-line text | placeholder, rows, validation (min/max length) |
| **NUMBER** | Number input | placeholder, min, max, step, validation |
| **SELECT** | Dropdown | options list, placeholder, allow multiple |
| **CHECKBOX** | Multiple checkboxes | options list, min/max selections |
| **RADIO** | Single choice | options list |
| **DATE** | Date picker | min date, max date |
| **FILE** | File upload | accepted types, max size |

### Per-Field Settings
- **Label**: Display name (e.g. "Full Name")
- **Name**: Machine key (e.g. "full_name")
- **Required**: Toggle
- **Placeholder**: Hint text
- **Help Text**: Description below field
- **Validation Rules**: Min/max length, regex pattern, custom error message

### Form-Level Settings
- **Title**: Form name
- **Description**: Subtitle/help text
- **Honeypot**: Anti-spam hidden field
- **Webhook URL**: POST on submission
- **Email Notification**: Send alert to email
- **Allow Anonymous**: No wallet required to submit
- **Max Submissions**: Limit total submissions
- **Expiry Date**: Auto-disable after date

## Builder UI

### Left Panel: Field Library
Grid of field type cards. Click to add.

### Center Panel: Live Preview
Drag-and-drop to reorder fields. Shows actual form appearance.

### Right Panel: Field Config
Contextual settings based on selected field type.
- Text/Email/Textarea: Label, placeholder, required toggle, validation rules
- Select/Checkbox/Radio: Options editor (add/remove/reorder)
- Number: Min, max, step
- Date: Date range
- File: Accept types, max size

### Bottom Panel: Form Settings
Title, description, honeypot, webhook, notifications, expiry.

### Actions
- **Preview Form**: Open in new tab
- **Save & Deploy**: Create on Aptos
- **Get Embed Code**: Copy script/iframe
- **Duplicate Field**: Clone with same config
- **Delete Field**: Remove from form

## Data Flow

```
Owner opens builder
  → Select field type from library
  → Field appears in preview
  → Edit field config in right panel
  → Drag to reorder
  → Configure form settings
  → Click "Save & Deploy"
  → Upload config as JSON blob to Shelby
  → Create Form on Aptos Move contract
  → Get formId + embed code
```

## Implementation

### Data Model
```typescript
interface FormBuilderState {
  formConfig: FormConfig;
  selectedFieldId: string | null;
  isDragging: boolean;
  draggedFieldId: string | null;
}
```

### Components
- `FieldLibrary`: Grid of addable field types
- `FormPreview`: Live form with drag-and-drop
- `FieldConfig`: Dynamic config panel
- `FormSettings`: Global form configuration
- `FieldRenderer`: Renders each field in preview

### Key Features
1. **Drag & Drop**: Native HTML5 drag API or @dnd-kit
2. **Validation Builder**: Visual rule builder (min/max/pattern)
3. **Options Editor**: Inline list editor for select/checkbox/radio
4. **Real-time Preview**: Updates instantly as owner configures
5. **Undo/Redo**: State history for builder actions
