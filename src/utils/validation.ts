// Input validation utilities

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  value: any;
  rules: Array<{
    type: 'required' | 'minLength' | 'maxLength' | 'email' | 'pattern' | 'custom';
    value?: any;
    message?: string;
    validator?: (val: any) => boolean;
  }>;
}

// Validate multiple fields
export function validate(rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const fieldErrors = validateField(rule);
    errors.push(...fieldErrors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate single field
function validateField(rule: ValidationRule): string[] {
  const errors: string[] = [];
  const { field, value, rules: fieldRules } = rule;

  for (const fieldRule of fieldRules) {
    switch (fieldRule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          errors.push(fieldRule.message || `${field} is required`);
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < (fieldRule.value || 0)) {
          errors.push(
            fieldRule.message || 
            `${field} must be at least ${fieldRule.value} characters`
          );
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > (fieldRule.value || 0)) {
          errors.push(
            fieldRule.message || 
            `${field} must be at most ${fieldRule.value} characters`
          );
        }
        break;

      case 'email':
        if (typeof value === 'string' && !isValidEmail(value)) {
          errors.push(fieldRule.message || `${field} must be a valid email`);
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && fieldRule.value instanceof RegExp) {
          if (!fieldRule.value.test(value)) {
            errors.push(
              fieldRule.message || 
              `${field} format is invalid`
            );
          }
        }
        break;

      case 'custom':
        if (fieldRule.validator && !fieldRule.validator(value)) {
          errors.push(
            fieldRule.message || 
            `${field} validation failed`
          );
        }
        break;
    }
  }

  return errors;
}

// Helper: Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== Specific Validators =====

// Validate registration input
export function validateRegister(data: {
  username?: string;
  password?: string;
  name?: string;
}): ValidationResult {
  return validate([
    {
      field: 'username',
      value: data.username,
      rules: [
        { type: 'required', message: 'Username is required' },
        { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' },
        { type: 'maxLength', value: 50, message: 'Username must be at most 50 characters' },
        {
          type: 'pattern',
          value: /^[a-zA-Z0-9_-]+$/,
          message: 'Username can only contain letters, numbers, underscores and hyphens'
        }
      ]
    },
    {
      field: 'password',
      value: data.password,
      rules: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 6, message: 'Password must be at least 6 characters' },
        { type: 'maxLength', value: 100, message: 'Password must be at most 100 characters' }
      ]
    },
    {
      field: 'name',
      value: data.name,
      rules: [
        { type: 'required', message: 'Name is required' },
        { type: 'minLength', value: 1, message: 'Name cannot be empty' },
        { type: 'maxLength', value: 100, message: 'Name must be at most 100 characters' }
      ]
    }
  ]);
}

// Validate login input
export function validateLogin(data: {
  username?: string;
  password?: string;
}): ValidationResult {
  return validate([
    {
      field: 'username',
      value: data.username,
      rules: [
        { type: 'required', message: 'Username is required' }
      ]
    },
    {
      field: 'password',
      value: data.password,
      rules: [
        { type: 'required', message: 'Password is required' }
      ]
    }
  ]);
}

// Validate create post input
export function validateCreatePost(data: {
  title?: string;
  content?: string;
}): ValidationResult {
  return validate([
    {
      field: 'title',
      value: data.title,
      rules: [
        { type: 'required', message: 'Title is required' },
        { type: 'minLength', value: 1, message: 'Title cannot be empty' },
        { type: 'maxLength', value: 200, message: 'Title must be at most 200 characters' }
      ]
    },
    {
      field: 'content',
      value: data.content,
      rules: [
        { type: 'required', message: 'Content is required' },
        { type: 'minLength', value: 1, message: 'Content cannot be empty' },
        { type: 'maxLength', value: 10000, message: 'Content must be at most 10000 characters' }
      ]
    }
  ]);
}

// Validate create comment input
export function validateCreateComment(data: {
  content?: string;
  post_uuid?: string;
}): ValidationResult {
  return validate([
    {
      field: 'content',
      value: data.content,
      rules: [
        { type: 'required', message: 'Content is required' },
        { type: 'minLength', value: 1, message: 'Content cannot be empty' },
        { type: 'maxLength', value: 1000, message: 'Content must be at most 1000 characters' }
      ]
    },
    {
      field: 'post_uuid',
      value: data.post_uuid,
      rules: [
        { type: 'required', message: 'Post UUID is required' }
      ]
    }
  ]);
}

// Validate search query
export function validateSearchQuery(query?: string): ValidationResult {
  return validate([
    {
      field: 'search query',
      value: query,
      rules: [
        { type: 'required', message: 'Search query is required' },
        { type: 'minLength', value: 1, message: 'Search query cannot be empty' },
        { type: 'maxLength', value: 100, message: 'Search query must be at most 100 characters' }
      ]
    }
  ]);
}

// Validate pagination parameters
export function validatePagination(data: {
  limit?: number;
  offset?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (data.limit !== undefined) {
    if (typeof data.limit !== 'number' || data.limit < 1) {
      errors.push('Limit must be a positive number');
    }
    if (data.limit > 100) {
      errors.push('Limit must be at most 100');
    }
  }

  if (data.offset !== undefined) {
    if (typeof data.offset !== 'number' || data.offset < 0) {
      errors.push('Offset must be a non-negative number');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate UUID format
export function validateUUID(uuid?: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return validate([
    {
      field: 'UUID',
      value: uuid,
      rules: [
        { type: 'required', message: 'UUID is required' },
        {
          type: 'pattern',
          value: uuidRegex,
          message: 'Invalid UUID format'
        }
      ]
    }
  ]);
}

// Helper to format validation errors for response
export function formatValidationErrors(result: ValidationResult): string {
  return result.errors.join('; ');
}

