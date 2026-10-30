export interface ValidationResult {
  valid: boolean;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*\.?$/u;
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export function validateEmail(email: string): ValidationResult {
  const value = email.trim();

  if (!value) {
    return {
      valid: false,
      message: "Please enter the customer email.",
    };
  }

  if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  return { valid: true, message: "" };
}

export function validateCustomerName(name: string): ValidationResult {
  const value = name.trim();

  if (!value) {
    return { valid: true, message: "" };
  }

  if (value.length < 2 || value.length > 150) {
    return {
      valid: false,
      message: "Customer name must be between 2 and 150 characters.",
    };
  }

  if (!NAME_PATTERN.test(value)) {
    return {
      valid: false,
      message:
        "Enter a valid customer name using letters, spaces, apostrophes or hyphens.",
    };
  }

  return { valid: true, message: "" };
}

export function validateAmountReceived(amount: string): ValidationResult {
  const value = amount.trim();

  if (!value) {
    return { valid: true, message: "" };
  }

  if (!AMOUNT_PATTERN.test(value)) {
    return {
      valid: false,
      message: "Enter a valid amount with up to two decimal places.",
    };
  }

  const parsed = Number(value);
  const paise = Math.round(parsed * 100);

  if (!Number.isFinite(parsed) || !Number.isSafeInteger(paise)) {
    return {
      valid: false,
      message: "Enter a valid amount within the supported limit.",
    };
  }

  return { valid: true, message: "" };
}
