import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Mentions <span className="text-gold">Legales</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Editeur du site</h2>
          <div className="text-sm text-gray-400 leading-relaxed space-y-1">
            <p><span className="text-gray-300">Raison sociale :</span> Premium Store</p>
            <p><span className="text-gray-300">Forme juridique :</span> [A completer]</p>
            <p><span className="text-gray-300">Siege social :</span> [Adresse a completer]</p>
            <p><span className="text-gray-300">SIRET :</span> [Numero a completer]</p>
            <p><span className="text-gray-300">RCS :</span> [Numero a completer]</p>
            <p><span className="text-gray-300">TVA intracommunautaire :</span> [Numero a completer]</p>
            <p><span className="text-gray-300">Directeur de publication :</span> [Nom a completer]</p>
            <p><span className="text-gray-300">Email :</span> support@premiumstore.fr</p>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Hebergement</h2>
          <div className="text-sm text-gray-400 leading-relaxed space-y-1">
            <p><span className="text-gray-300">Hebergeur du site :</span> Vercel Inc.</p>
            <p><span className="text-gray-300">Adresse :</span> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
            <p><span className="text-gray-300">Site web :</span> vercel.com</p>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Propriete intellectuelle</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            L&apos;ensemble du contenu de ce site (textes, images, logos, icones, elements graphiques,
            code source) est la propriete exclusive de Premium Store ou de ses partenaires et est protege
            par le droit d&apos;auteur, le droit des marques et le droit de la propriete intellectuelle.
            Toute reproduction, representation, modification, publication ou adaptation de tout ou partie
            des elements du site est interdite sans autorisation ecrite prealable.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Responsabilite</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium Store s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusees sur ce site.
            Toutefois, Premium Store ne peut garantir l&apos;exactitude, la completude et l&apos;actualite
            des informations mises a disposition. Premium Store decline toute responsabilite pour tout
            dommage resultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant entraine une modification
            des informations mises a la disposition sur le site.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Cookies</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Ce site utilise des cookies essentiels au fonctionnement du service (authentification, panier,
            preferences utilisateur). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilise.
            Vous pouvez gerer vos preferences de cookies depuis votre profil ou via la banniere de
            consentement. Pour en savoir plus, consultez notre{' '}
            <Link href="/confidentialite" className="text-gold hover:text-gold-light transition-colors">
              politique de confidentialite
            </Link>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Droit applicable</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les presentes mentions legales sont soumises au droit francais. En cas de litige, et apres
            tentative de recherche d&apos;une solution amiable, competence est donnee aux tribunaux
            francais competents.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Pour toute question concernant ces mentions legales, vous pouvez nous contacter a
            l&apos;adresse email : <span className="text-gold">support@premiumstore.fr</span> ou
            via notre{' '}
            <Link href="/support" className="text-gold hover:text-gold-light transition-colors">
              page support
            </Link>.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors">
            &larr; Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
