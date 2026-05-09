import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="client-page min-h-screen">
      <section className="client-hero" aria-labelledby="not-found-title">
        <p className="client-eyebrow">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <p className="client-copy">The page was removed or does not exist in this client application.</p>
        <Link className="client-link" to="/">
          Back home
        </Link>
      </section>
    </main>
  )
}
