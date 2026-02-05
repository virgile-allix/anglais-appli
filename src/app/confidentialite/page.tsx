'use client'

import Link from 'next/link'
import { useI18n } from '@/context/LanguageContext'

export default function ConfidentialitePage() {
  const { t, localeTag } = useI18n()

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {t('Politique de', 'Privacy')} <span className="text-gold">{t('Confidentialite', 'Policy')}</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">{t('Derniere mise a jour :', 'Last updated:')} {new Date().toLocaleDateString(localeTag)}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('1. Responsable du traitement', '1. Data controller')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Le responsable du traitement des donnees personnelles est Premium Store, joignable a l'adresse :`,
              'The data controller is Premium Store, reachable at:'
            )} <span className="text-gold">support@premiumstore.fr</span>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('2. Donnees collectees', '2. Data collected')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            {t(
              'Dans le cadre de notre activite, nous collectons les donnees suivantes :',
              'In the course of our activity, we collect the following data:'
            )}
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t(`Donnees d'identification :`, 'Identification data:')}</span> {t('adresse email, mot de passe (chiffre)', 'email address, password (hashed)')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de livraison :', 'Shipping data:')}</span> {t('nom, prenom, adresse postale, telephone', 'first name, last name, postal address, phone')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de commande :', 'Order data:')}</span> {t('produits commandes, montants, statut', 'ordered products, amounts, status')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de paiement :', 'Payment data:')}</span> {t('traitees directement par Stripe/PayPal (non stockees sur nos serveurs)', 'processed directly by Stripe/PayPal (not stored on our servers)')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de navigation :', 'Browsing data:')}</span> {t('cookies fonctionnels (panier, session)', 'functional cookies (cart, session)')}</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('3. Finalites du traitement', '3. Purposes of processing')}</h2>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> {t('Gestion de votre compte utilisateur', 'Managing your user account')}</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> {t('Traitement et suivi de vos commandes', 'Processing and tracking your orders')}</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> {t('Livraison des produits commandes', 'Delivery of ordered products')}</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> {t('Gestion du service client et des tickets support', 'Customer service and support ticket management')}</li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> {t('Amelioration de nos services', 'Improving our services')}</li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('4. Base legale', '4. Legal basis')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Le traitement de vos donnees est fonde sur : l'execution du contrat (commande), votre consentement (creation de compte, cookies), et nos obligations legales (facturation, comptabilite).",
              'Processing of your data is based on: performance of the contract (order), your consent (account creation, cookies), and our legal obligations (billing, accounting).'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('5. Destinataires des donnees', '5. Data recipients')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Vos donnees sont accessibles uniquement par l'equipe Premium Store. Elles peuvent etre transmises a nos sous-traitants techniques :`,
              'Your data is accessible only by the Premium Store team. It may be transmitted to our technical subcontractors:'
            )}
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4 mt-3">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Firebase / Google Cloud :</span> {t('hebergement et base de donnees', 'hosting and database')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Stripe :</span> {t('traitement des paiements par carte', 'card payment processing')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">PayPal :</span> {t('traitement des paiements PayPal', 'PayPal payment processing')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Vercel :</span> {t('hebergement du site', 'site hosting')}</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('6. Duree de conservation', '6. Retention periods')}</h2>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de compte :', 'Account data:')}</span> {t('conservees tant que le compte est actif, puis 3 ans apres suppression', 'kept while the account is active, then 3 years after deletion')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Donnees de commande :', 'Order data:')}</span> {t('conservees 10 ans (obligations comptables)', 'kept for 10 years (accounting obligations)')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">Cookies :</span> {t('13 mois maximum', '13 months maximum')}</span></li>
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('7. Cookies', '7. Cookies')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            {t('Ce site utilise uniquement des cookies fonctionnels essentiels :', 'This site only uses essential functional cookies:')}
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Authentification :', 'Authentication:')}</span> {t('maintien de votre session de connexion', 'keep your login session')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Panier :', 'Cart:')}</span> {t('sauvegarde des articles dans votre panier', 'save items in your cart')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Preferences :', 'Preferences:')}</span> {t(`consentement cookies, preferences d'affichage`, 'cookie consent, display preferences')}</span></li>
          </ul>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            {t(
              "Aucun cookie publicitaire, analytique ou de tracking tiers n'est utilise. Vous pouvez modifier vos preferences de cookies a tout moment depuis votre ",
              'No advertising, analytics, or third-party tracking cookies are used. You can change your cookie preferences at any time from your '
            )}
            <Link href="/account" className="text-gold hover:text-gold-light transition-colors">{t('profil', 'profile')}</Link>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('8. Vos droits (RGPD)', '8. Your rights (GDPR)')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            {t(
              'Conformement au Reglement General sur la Protection des Donnees (RGPD) et a la loi Informatique et Libertes, vous disposez des droits suivants :',
              'In accordance with GDPR and French data protection law, you have the following rights:'
            )}
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t("Droit d'acces :", 'Right of access:')}</span> {t('obtenir une copie de vos donnees personnelles', 'obtain a copy of your personal data')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Droit de rectification :', 'Right to rectification:')}</span> {t('modifier vos donnees inexactes', 'correct your inaccurate data')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t("Droit a l'effacement :", 'Right to erasure:')}</span> {t('demander la suppression de vos donnees', 'request deletion of your data')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Droit a la portabilite :', 'Right to data portability:')}</span> {t('recevoir vos donnees dans un format structure', 'receive your data in a structured format')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t("Droit d'opposition :", 'Right to object:')}</span> {t('vous opposer au traitement de vos donnees', 'object to the processing of your data')}</span></li>
            <li className="flex gap-2"><span className="text-gold">&#8226;</span> <span><span className="text-gray-300">{t('Droit de limitation :', 'Right to restriction:')}</span> {t('limiter le traitement de vos donnees', 'restrict processing of your data')}</span></li>
          </ul>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            {t(
              'Pour exercer ces droits, contactez-nous a :',
              'To exercise these rights, contact us at:'
            )} <span className="text-gold">support@premiumstore.fr</span>.
            {t(' Vous pouvez egalement introduire une reclamation aupres de la CNIL (cnil.fr).', ' You may also lodge a complaint with the CNIL (cnil.fr).')}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('9. Securite', '9. Security')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              'Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees personnelles contre tout acces non autorise, perte ou destruction. Les paiements sont securises via Stripe et PayPal. Les mots de passe sont chiffres et ne sont jamais stockes en clair.',
              'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or destruction. Payments are secured via Stripe and PayPal. Passwords are hashed and never stored in plain text.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('10. Modifications', '10. Changes')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              'Premium Store se reserve le droit de modifier la presente politique de confidentialite a tout moment. Les modifications entrent en vigueur des leur publication sur le site. Nous vous invitons a consulter regulierement cette page.',
              'Premium Store reserves the right to modify this privacy policy at any time. Changes take effect upon publication on the site. We encourage you to review this page regularly.'
            )}
          </p>
        </section>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors">
            &larr; {t("Retour a l'accueil", 'Back to home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
