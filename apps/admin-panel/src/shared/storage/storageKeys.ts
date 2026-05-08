const STORAGE_NAMESPACE = 'ai_admin_panel'

export function getStorageKey(key: string) {
  return `${STORAGE_NAMESPACE}:${key}`
}
