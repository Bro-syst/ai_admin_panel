export function valueOrEmpty(value: string | number | boolean | null | undefined, emptyValue: string) {
  return value === null || value === undefined || value === '' ? emptyValue : String(value)
}
