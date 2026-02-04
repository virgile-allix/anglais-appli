import Link from 'next/link'

export default function CGVPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1 className="text-3xl font-bold mb-2">
          Conditions Generales de <span className="text-gold">Vente</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 1 - Objet</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les presentes Conditions Generales de Vente (CGV) regissent les ventes de produits effectuees
            sur le site Premium Store. Toute commande implique l&apos;acceptation sans reserve des presentes CGV.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 2 - Produits</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les produits proposes sont ceux qui figurent sur le site au moment de la consultation.
            Les photographies et descriptions des produits sont les plus fideles possibles mais ne peuvent
            assurer une similitude parfaite avec le produit propose. Premium Store se reserve le droit de
            modifier ses produits a tout moment.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 3 - Prix</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les prix sont indiques en euros TTC (toutes taxes comprises). Premium Store se reserve le droit
            de modifier ses prix a tout moment, etant entendu que le prix figurant au catalogue le jour de
            la commande sera le seul applicable a l&apos;acheteur. Les frais de livraison sont calcules au
            moment de la commande.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 4 - Commande</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            L&apos;acheteur passe commande sur le site en ajoutant des produits a son panier puis en procedant
            au paiement. La commande n&apos;est definitive qu&apos;apres confirmation du paiement.
            Un email de confirmation est envoye a l&apos;acheteur. Premium Store se reserve le droit
            d&apos;annuler toute commande en cas de probleme de paiement ou de stock insuffisant.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 5 - Paiement</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Le paiement s&apos;effectue par carte bancaire via Stripe ou via PayPal.
            Le paiement est securise et les donnees bancaires ne sont pas stockees sur nos serveurs.
            La commande est validee a la reception du paiement integral.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 6 - Livraison</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les produits sont livres en France metropolitaine dans un delai de 3 a 5 jours ouvrés
            a compter de la confirmation de la commande. Les frais de livraison sont offerts a partir
            de 50 euros d&apos;achat. Premium Store ne saurait etre tenu responsable des retards de
            livraison dus au transporteur.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 7 - Droit de retractation</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Conformement a l&apos;article L221-18 du Code de la consommation, l&apos;acheteur dispose d&apos;un
            delai de 14 jours a compter de la reception du produit pour exercer son droit de retractation
            sans avoir a justifier de motifs ni a payer de penalites. Le produit doit etre retourne dans
            son etat d&apos;origine et complet. Le remboursement est effectue dans un delai de 14 jours
            suivant la reception du retour.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 8 - Garanties</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tous les produits beneficient de la garantie legale de conformite (articles L217-4 et suivants
            du Code de la consommation) et de la garantie des vices caches (articles 1641 et suivants du
            Code civil). En cas de defaut, l&apos;acheteur peut demander la reparation ou le remplacement
            du produit.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 9 - Litiges</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les presentes CGV sont soumises au droit francais. En cas de litige, une solution amiable
            sera recherchee avant toute action judiciaire. A defaut, les tribunaux francais seront seuls
            competents. Conformement a l&apos;article L612-1 du Code de la consommation, le consommateur
            peut recourir a un mediateur de la consommation.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Article 10 - Donnees personnelles</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Les informations collectees font l&apos;objet d&apos;un traitement informatique conforme au RGPD.
            Pour en savoir plus, consultez notre{' '}
            <Link href="/confidentialite" className="text-gold hover:text-gold-light transition-colors">
              politique de confidentialite
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
