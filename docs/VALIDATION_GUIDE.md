# 🔍 Input Validation Guide

Hướng dẫn sử dụng validation system của XSS Lab API.

## 📝 Tổng Quan

Tất cả input validation đã được tách ra file riêng `src/utils/validation.ts` để:
- ✅ Code dễ maintain và reusable
- ✅ Consistent validation rules across API
- ✅ Dễ dàng thêm/sửa validation rules
- ✅ Clear error messages

---

## 🏗️ Architecture

### Core Components

```typescript
// ValidationResult - Return type của validation functions
interface ValidationResult {
  valid: boolean;      // true nếu pass validation
  errors: string[];    // Array of error messages
}

// ValidationRule - Define validation cho một field
interface ValidationRule {
  field: string;       // Tên field
  value: any;          // Giá trị cần validate
  rules: Array<{       // Các rules cho field
    type: 'required' | 'minLength' | 'maxLength' | 'email' | 'pattern' | 'custom';
    value?: any;       // Value cho rule (e.g., minLength: 3)
    message?: string;  // Custom error message
    validator?: (val: any) => boolean;  // Custom validator function
  }>;
}
```

---

## 🎯 Validation Rules

### 1. `required`
Field không được empty/null/undefined

```typescript
{
  type: 'required',
  message: 'Username is required'  // optional
}
```

### 2. `minLength`
String phải có độ dài tối thiểu

```typescript
{
  type: 'minLength',
  value: 6,
  message: 'Password must be at least 6 characters'
}
```

### 3. `maxLength`
String không được vượt quá độ dài tối đa

```typescript
{
  type: 'maxLength',
  value: 100,
  message: 'Name must be at most 100 characters'
}
```

### 4. `email`
Validate email format

```typescript
{
  type: 'email',
  message: 'Invalid email format'
}
```

### 5. `pattern`
Validate với regex pattern

```typescript
{
  type: 'pattern',
  value: /^[a-zA-Z0-9_-]+$/,
  message: 'Username can only contain letters, numbers, underscores and hyphens'
}
```

### 6. `custom`
Custom validation function

```typescript
{
  type: 'custom',
  validator: (val) => val > 0 && val < 100,
  message: 'Value must be between 0 and 100'
}
```

---

## 📦 Built-in Validators

### 1. `validateRegister(data)`

Validate registration data

**Input:**
```typescript
{
  username?: string;
  password?: string;
  name?: string;
}
```

**Rules:**
- `username`: required, 3-50 chars, alphanumeric + underscore/hyphen only
- `password`: required, 6-100 chars
- `name`: required, 1-100 chars

**Example:**
```typescript
import { validateRegister } from '../utils/validation';

const validation = validateRegister({
  username: 'testuser',
  password: '123456',
  name: 'Test User'
});

if (!validation.valid) {
  console.error(validation.errors);
  // ['Username must be at least 3 characters']
}
```

---

### 2. `validateLogin(data)`

Validate login data

**Input:**
```typescript
{
  username?: string;
  password?: string;
}
```

**Rules:**
- `username`: required
- `password`: required

---

### 3. `validateCreatePost(data)`

Validate create post data

**Input:**
```typescript
{
  title?: string;
  content?: string;
}
```

**Rules:**
- `title`: required, 1-200 chars
- `content`: required, 1-10000 chars

---

### 4. `validateCreateComment(data)`

Validate create comment data

**Input:**
```typescript
{
  content?: string;
  post_uuid?: string;
}
```

**Rules:**
- `content`: required, 1-1000 chars
- `post_uuid`: required

---

### 5. `validateSearchQuery(query)`

Validate search query

**Input:** `string`

**Rules:**
- required, 1-100 chars

---

### 6. `validatePagination(data)`

Validate pagination parameters

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
}
```

**Rules:**
- `limit`: 1-100
- `offset`: >= 0

---

### 7. `validateUUID(uuid)`

Validate UUID format

**Input:** `string`

**Rules:**
- required
- Must match UUID v4 format

---

## 🔧 Usage in Handlers

### Basic Usage

```typescript
import { validateRegister, formatValidationErrors } from '../utils/validation';

export async function handleRegister(request: Request, env: Env) {
  const body = await request.json();
  
  // Validate
  const validation = validateRegister(body);
  
  // Check if valid
  if (!validation.valid) {
    // Format errors và return response
    return errorResponse(
      formatValidationErrors(validation),
      400
    );
  }
  
  // Continue with business logic...
}
```

### With Response Options

```typescript
import { validateCreatePost, formatValidationErrors } from '../utils/validation';

export async function handleCreatePost(request: Request, env: Env) {
  const config = getEnvConfig(env);
  const responseOptions = { corsOrigin: config.CORS_ORIGIN };
  
  const body = await request.json();
  
  const validation = validateCreatePost(body);
  if (!validation.valid) {
    return errorResponse(
      formatValidationErrors(validation),
      400,
      undefined,
      responseOptions
    );
  }
  
  // Continue...
}
```

---

## 🎨 Custom Validation

### Create Custom Validator

```typescript
import { validate, ValidationResult } from '../utils/validation';

export function validateCustom(data: any): ValidationResult {
  return validate([
    {
      field: 'age',
      value: data.age,
      rules: [
        { type: 'required' },
        {
          type: 'custom',
          validator: (val) => val >= 18 && val <= 100,
          message: 'Age must be between 18 and 100'
        }
      ]
    },
    {
      field: 'email',
      value: data.email,
      rules: [
        { type: 'required' },
        { type: 'email' }
      ]
    }
  ]);
}
```

### Use in Handler

```typescript
const validation = validateCustom(body);
if (!validation.valid) {
  return errorResponse(formatValidationErrors(validation));
}
```

---

## 📊 Validation Error Messages

### Format

Errors are formatted as: `"Error1; Error2; Error3"`

**Example:**
```typescript
const validation = validateRegister({
  username: 'ab',      // Too short
  password: '123',     // Too short
  name: ''             // Empty
});

console.log(formatValidationErrors(validation));
// "Username must be at least 3 characters; Password must be at least 6 characters; Name cannot be empty"
```

### Custom Messages

Tất cả validation rules đều support custom messages:

```typescript
{
  field: 'username',
  value: data.username,
  rules: [
    {
      type: 'minLength',
      value: 3,
      message: 'Tên đăng nhập phải có ít nhất 3 ký tự'  // Custom message
    }
  ]
}
```

---

## ✅ Best Practices

### 1. Always Validate Early

Validate ngay khi nhận request, trước khi xử lý business logic:

```typescript
// ✅ Good
export async function handleCreate(request: Request, env: Env) {
  const body = await request.json();
  
  // Validate first
  const validation = validateInput(body);
  if (!validation.valid) {
    return errorResponse(formatValidationErrors(validation));
  }
  
  // Then process
  await processData(body);
}

// ❌ Bad
export async function handleCreate(request: Request, env: Env) {
  const body = await request.json();
  
  // Process first, validate later
  await processData(body);
  
  const validation = validateInput(body);
  // Too late!
}
```

### 2. Use Specific Validators

Sử dụng built-in validators thay vì `validate()` trực tiếp:

```typescript
// ✅ Good - Clear intent
const validation = validateRegister(body);

// ❌ Less clear
const validation = validate([
  { field: 'username', value: body.username, rules: [...] },
  // ...
]);
```

### 3. Consistent Error Messages

Sử dụng `formatValidationErrors()` để consistent format:

```typescript
// ✅ Good
return errorResponse(formatValidationErrors(validation));

// ❌ Inconsistent
return errorResponse(validation.errors[0]);
```

### 4. Add Validation for New Endpoints

Khi thêm endpoint mới, luôn tạo validator:

```typescript
// 1. Create validator in validation.ts
export function validateNewFeature(data: any): ValidationResult {
  return validate([...]);
}

// 2. Use in handler
const validation = validateNewFeature(body);
if (!validation.valid) {
  return errorResponse(formatValidationErrors(validation));
}
```

---

## 🧪 Testing Validation

### Test Valid Input

```typescript
const validation = validateRegister({
  username: 'testuser',
  password: '123456',
  name: 'Test User'
});

console.assert(validation.valid === true);
console.assert(validation.errors.length === 0);
```

### Test Invalid Input

```typescript
const validation = validateRegister({
  username: 'ab',      // Too short
  password: '123',     // Too short
  name: ''             // Empty
});

console.assert(validation.valid === false);
console.assert(validation.errors.length === 3);
console.log(validation.errors);
// [
//   "Username must be at least 3 characters",
//   "Password must be at least 6 characters",
//   "Name cannot be empty"
// ]
```

---

## 📈 Validation Rules Summary

| Validator | Fields | Required | Min/Max Length | Pattern |
|-----------|--------|----------|----------------|---------|
| `validateRegister` | username | ✅ | 3-50 | `^[a-zA-Z0-9_-]+$` |
| | password | ✅ | 6-100 | - |
| | name | ✅ | 1-100 | - |
| `validateLogin` | username | ✅ | - | - |
| | password | ✅ | - | - |
| `validateCreatePost` | title | ✅ | 1-200 | - |
| | content | ✅ | 1-10000 | - |
| `validateCreateComment` | content | ✅ | 1-1000 | - |
| | post_uuid | ✅ | - | - |
| `validateSearchQuery` | query | ✅ | 1-100 | - |
| `validatePagination` | limit | - | 1-100 | - |
| | offset | - | >= 0 | - |
| `validateUUID` | uuid | ✅ | - | UUID v4 |

---

## 🔄 Migration from Old Code

### Before (Inline Validation)

```typescript
// Old code - validation in handler
if (!username || !password || !name) {
  return errorResponse('Username, password, and name are required');
}

if (username.length < 3) {
  return errorResponse('Username must be at least 3 characters');
}

if (password.length < 6) {
  return errorResponse('Password must be at least 6 characters');
}
```

### After (Using Validator)

```typescript
// New code - using validator
const validation = validateRegister({ username, password, name });
if (!validation.valid) {
  return errorResponse(formatValidationErrors(validation));
}
```

**Benefits:**
- ✅ 8 dòng → 3 dòng code
- ✅ Reusable validation logic
- ✅ Consistent error messages
- ✅ Easier to test
- ✅ Centralized validation rules

---

## 🆘 Troubleshooting

### Error: "Username is required"

**Cause:** Field undefined, null, hoặc empty string

**Fix:** Ensure field có giá trị:
```typescript
const data = {
  username: 'test',  // Not empty
  password: '123456',
  name: 'Test'
};
```

### Error: "Must be at least X characters"

**Cause:** String quá ngắn

**Fix:** Check độ dài minimum trong validator

### Custom Validation Not Working

**Cause:** Custom validator function return type không đúng

**Fix:** Ensure function returns `boolean`:
```typescript
{
  type: 'custom',
  validator: (val) => {
    return val > 0;  // Must return boolean
  }
}
```

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - API endpoints
- [Error Handling](../src/utils/response.ts) - Error response helpers
- [Type Definitions](../src/types/api.ts) - Request/Response types

---

**Last Updated**: 2025-10-21  
**Version**: 1.0.0

