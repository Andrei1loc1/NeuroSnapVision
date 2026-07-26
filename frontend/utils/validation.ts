export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value !== null && value !== undefined) return true;
  return false;
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Parola trebuie să aibă minim 8 caractere");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Parola trebuie să conțină cel puțin o literă mare");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Parola trebuie să conțină cel puțin o literă mică");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Parola trebuie să conțină cel puțin o cifră");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validate(
  value: unknown,
  rules: Array<{
    validate: (value: unknown) => boolean;
    message: string;
  }>
): ValidationResult {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return { valid: false, error: rule.message };
    }
  }
  return { valid: true };
}