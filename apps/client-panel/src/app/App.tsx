import { Route, Routes } from 'react-router-dom'
import { ClientHomePage } from '@/app/ClientHomePage'
import { NotFoundPage } from '@/shared/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientHomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
