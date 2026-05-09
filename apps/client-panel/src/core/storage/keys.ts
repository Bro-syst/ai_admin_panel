const STORAGE_NAMESPACE = 'payment_terminal_front'

export function createStorageKey(key: string) {
  return `${STORAGE_NAMESPACE}.${key}`
}
