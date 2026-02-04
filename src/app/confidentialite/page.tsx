import Link from 'next/link'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Politique de <span className="text-gold">Confidentialite</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">1. Responsable du traitement</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Le responsable du traitement des donnees personnelles est Premium Store,
            joignable a l&apos;adresse : <span className="text-gold">support@premiumstore.fr</span>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">2. Donnees collectees</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Dans le cadre de notre activite, nous collectons les donnees suivantes :
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees d&apos;identification :</span> adresse email, mot de passe (chiffre)</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de livraison :</span> nom, prenom, adresse postale, telephone</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de commande :</span> produits commandes, montants, statut</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de paiement :</span> traitees directement par Stripe/PayPal (non stockees sur nos serveurs)</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de navigation :</span> cookies fonctionnels (panier, session)</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">3. Finalites du traitement</h2>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> Gestion de votre compte utilisateur</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> Traitement et suivi de vos commandes</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> Livraison des produits commandes</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> Gestion du service client et des tickets support</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> Amelioration de nos services</li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">4. Base legale</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Le traitement de vos donnees est fonde sur : l&apos;execution du contrat (commande),
            votre consentement (creation de compte, cookies), et nos obligations legales
            (facturation, comptabilite).
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">5. Destinataires des donnees</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Vos donnees sont accessibles uniquement par l&apos;equipe Premium Store. Elles peuvent
            etre transmises a nos sous-traitants techniques :
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4 mt-3">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Firebase / Google Cloud :</span> hebergement et base de donnees</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Stripe :</span> traitement des paiements par carte</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">PayPal :</span> traitement des paiements PayPal</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Vercel :</span> hebergement du site</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">6. Duree de conservation</h2>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de compte :</span> conservees tant que le compte est actif, puis 3 ans apres suppression</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Donnees de commande :</span> conservees 10 ans (obligations comptables)</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Cookies :</span> 13 mois maximum</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Ce site utilise uniquement des cookies fonctionnels essentiels :
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Authentification :</span> maintien de votre session de connexion</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Panier :</span> sauvegarde des articles dans votre panier</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Preferences :</span> consentement cookies, preferences d&apos;affichage</span></li>
          </ul>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            Aucun cookie publicitaire, analytique ou de tracking tiers n&apos;est utilise.
            Vous pouvez modifier vos preferences de cookies a tout moment depuis votre{' '}
            <Link href="/account" className="text-gold hover:text-gold-light transition-colors">profil</Link>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">8. Vos droits (RGPD)</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Conformement au Reglement General sur la Protection des Donnees (RGPD) et a la loi
            Informatique et Libertes, vous disposez des droits suivants :
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit d&apos;acces :</span> obtenir une copie de vos donnees personnelles</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit de rectification :</span> modifier vos donnees inexactes</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit a l&apos;effacement :</span> demander la suppression de vos donnees</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit a la portabilite :</span> recevoir vos donnees dans un format structure</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit d&apos;opposition :</span> vous opposer au traitement de vos donnees</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Droit de limitation :</span> limiter le traitement de vos donnees</span></li>
          </ul>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous a : <span className="text-gold">support@premiumstore.fr</span>.
            Vous pouvez egalement introduire une reclamation aupres de la CNIL (cnil.fr).
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">9. Securite</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger
            vos donnees personnelles contre tout acces non autorise, perte ou destruction. Les paiements
            sont securises via Stripe et PayPal. Les mots de passe sont chiffres et ne sont jamais
            stockes en clair.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">10. Modifications</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium Store se reserve le droit de modifier la presente politique de confidentialite a tout moment.
            Les modifications entrent en vigueur des leur publication sur le site. Nous vous invitons a
            consulter regulierement cette page.
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
