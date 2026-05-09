import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '@/app/App'

test('renders client panel home page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'Client Panel' })).toBeInTheDocument()
})

test('renders not found page for unknown routes', () => {
  render(
    <MemoryRouter initialEntries={['/missing']}>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
})
