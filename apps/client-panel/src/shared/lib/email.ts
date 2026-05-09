export function sanitizeEmailInput(raw: string) {
  return raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '')
}
