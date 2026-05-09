export type AppNoticeTone = 'info' | 'warning' | 'success'

export type AppNoticeAction =
  | {
      kind: 'route'
      label: string
      to: string
    }
  | {
      kind: 'button'
      label: string
      onSelect: () => void
    }

export type AppNotice = {
  id: string
  priority: number
  tone: AppNoticeTone
  title: string
  description?: string
  action?: AppNoticeAction
}
