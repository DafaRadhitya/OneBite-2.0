import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="text-5xl">🥡</div>
      <h1 className="mt-3 font-display text-2xl font-bold">Nothing here</h1>
      <p className="mt-1 text-sm text-muted">That page or place doesn't exist (anymore).</p>
      <Link to="/" className="mt-5 inline-block rounded-full bg-terra px-5 py-2.5 text-sm font-extrabold text-white">Back to rolling</Link>
    </div>
  )
}
