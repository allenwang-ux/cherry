export const SHIFT_CODES = ['A', 'B', 'C', 'H', 'I', 'X'];

export function normalizeShiftCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('+');
}

export function isAllowedShift(value) {
  const normalized = normalizeShiftCode(value);
  if (!normalized) {
    return false;
  }

  return normalized.split('+').every((part) => SHIFT_CODES.includes(part));
}
