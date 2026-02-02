import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-gold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          Cette page n&apos;existe pas.
        </p>
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
