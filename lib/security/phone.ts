/** Normalize Bangladesh mobile numbers to a comparable digit string (01XXXXXXXXX). */
export function normalizeBdPhone(phone?: string | null): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) {
    digits = digits.slice(3);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = `0${digits}`;
  }
  return digits;
}

export function phonesMatch(left?: string | null, right?: string | null): boolean {
  const a = normalizeBdPhone(left);
  const b = normalizeBdPhone(right);
  return Boolean(a) && a === b;
}
