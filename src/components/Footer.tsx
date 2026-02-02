import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold mb-3">
              <span className="text-gold">PREMIUM</span>{' '}
              <span className="text-white">STORE</span>
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Des produits d&apos;exception, une expérience unique.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Navigation
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors">Accueil</Link>
              <Link href="/shop" className="text-sm text-gray-500 hover:text-gold transition-colors">Boutique</Link>
              <Link href="/account" className="text-sm text-gray-500 hover:text-gold transition-colors">Mon compte</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Informations
            </h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">CGV (bientôt)</span>
              <span className="text-sm text-gray-500">Politique de confidentialité (bientôt)</span>
              <span className="text-sm text-gray-500">Contact (bientôt)</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Premium Store. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
