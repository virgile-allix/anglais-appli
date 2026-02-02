import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold mb-3">
              <span className="text-gold">PREMIUM</span>{' '}
              <span className="text-white">STORE</span>
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Des produits d&apos;exception, une exp&eacute;rience unique.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Navigation
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors">Accueil</Link>
              <Link href="/shop" className="text-sm text-gray-500 hover:text-gold transition-colors">Boutique</Link>
              <Link href="/cart" className="text-sm text-gray-500 hover:text-gold transition-colors">Panier</Link>
              <Link href="/orders" className="text-sm text-gray-500 hover:text-gold transition-colors">Mes commandes</Link>
            </div>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Mon compte
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/account" className="text-sm text-gray-500 hover:text-gold transition-colors">Mon profil</Link>
              <Link href="/support" className="text-sm text-gray-500 hover:text-gold transition-colors">Support</Link>
              <Link href="/login" className="text-sm text-gray-500 hover:text-gold transition-colors">Connexion</Link>
              <Link href="/register" className="text-sm text-gray-500 hover:text-gold transition-colors">Inscription</Link>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Informations
            </h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Livraison 3-5 jours</span>
              <span className="text-sm text-gray-500">Retours sous 14 jours</span>
              <span className="text-sm text-gray-500">Paiement s&eacute;curis&eacute;</span>
              <span className="text-sm text-gray-500">support@premiumstore.fr</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Premium Store. Tous droits r&eacute;serv&eacute;s.
          </p>
        </div>
      </div>
    </footer>
  )
}
