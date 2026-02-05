'use client'

import Link from 'next/link'
import { useI18n } from '@/context/LanguageContext'

export default function MentionsLegalesPage() {
  const { t, localeTag } = useI18n()

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {t('Mentions', 'Legal')} <span className="text-gold">{t('Legales', 'Notice')}</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">{t('Derniere mise a jour :', 'Last updated:')} {new Date().toLocaleDateString(localeTag)}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Editeur du site', 'Website publisher')}</h2>
          <div className="text-sm text-gray-400 leading-relaxed space-y-1">
            <p><span className="text-gray-300">{t('Raison sociale :', 'Company name:')}</span> Premium Store</p>
            <p><span className="text-gray-300">{t('Forme juridique :', 'Legal form:')}</span> [A completer]</p>
            <p><span className="text-gray-300">{t('Siege social :', 'Registered office:')}</span> [Adresse a completer]</p>
            <p><span className="text-gray-300">SIRET :</span> [Numero a completer]</p>
            <p><span className="text-gray-300">RCS :</span> [Numero a completer]</p>
            <p><span className="text-gray-300">{t('TVA intracommunautaire :', 'VAT number:')}</span> [Numero a completer]</p>
            <p><span className="text-gray-300">{t('Directeur de publication :', 'Publication director:')}</span> [Nom a completer]</p>
            <p><span className="text-gray-300">Email :</span> support@premiumstore.fr</p>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Hebergement', 'Hosting')}</h2>
          <div className="text-sm text-gray-400 leading-relaxed space-y-1">
            <p><span className="text-gray-300">{t('Hebergeur du site :', 'Hosting provider:')}</span> Vercel Inc.</p>
            <p><span className="text-gray-300">{t('Adresse :', 'Address:')}</span> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
            <p><span className="text-gray-300">{t('Site web :', 'Website:')}</span> vercel.com</p>
          </div>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Propriete intellectuelle', 'Intellectual property')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "L'ensemble du contenu de ce site (textes, images, logos, icones, elements graphiques, code source) est la propriete exclusive de Premium Store ou de ses partenaires et est protege par le droit d'auteur, le droit des marques et le droit de la propriete intellectuelle. Toute reproduction, representation, modification, publication ou adaptation de tout ou partie des elements du site est interdite sans autorisation ecrite prealable.",
              'All content on this site (texts, images, logos, icons, graphic elements, source code) is the exclusive property of Premium Store or its partners and is protected by copyright, trademark law, and intellectual property rights. Any reproduction, representation, modification, publication, or adaptation of all or part of the site elements is prohibited without prior written authorization.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Responsabilite', 'Liability')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Premium Store s'efforce d'assurer l'exactitude des informations diffusees sur ce site. Toutefois, Premium Store ne peut garantir l'exactitude, la completude et l'actualite des informations mises a disposition. Premium Store decline toute responsabilite pour tout dommage resultant d'une intrusion frauduleuse d'un tiers ayant entraine une modification des informations mises a la disposition sur le site.",
              'Premium Store strives to ensure the accuracy of the information published on this site. However, Premium Store cannot guarantee the accuracy, completeness, or timeliness of the information provided. Premium Store declines all liability for any damage resulting from a fraudulent intrusion by a third party that caused modifications to the information made available on the site.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Cookies</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Ce site utilise des cookies essentiels au fonctionnement du service (authentification, panier, preferences utilisateur). Aucun cookie publicitaire ou de tracking tiers n'est utilise. Vous pouvez gerer vos preferences de cookies depuis votre profil ou via la banniere de consentement. Pour en savoir plus, consultez notre",
              'This site uses essential cookies required for the service to function (authentication, cart, user preferences). No advertising or third-party tracking cookies are used. You can manage your cookie preferences from your profile or via the consent banner. To learn more, see our'
            )}{' '}
            <Link href="/confidentialite" className="text-gold hover:text-gold-light transition-colors">
              {t('politique de confidentialite', 'privacy policy')}
            </Link>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Droit applicable', 'Governing law')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Les presentes mentions legales sont soumises au droit francais. En cas de litige, et apres tentative de recherche d'une solution amiable, competence est donnee aux tribunaux francais competents.",
              'These legal notices are governed by French law. In case of dispute, and after attempting to find an amicable solution, jurisdiction is given to the competent French courts.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Contact', 'Contact')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Pour toute question concernant ces mentions legales, vous pouvez nous contacter a l'adresse email :",
              'For any question regarding these legal notices, you can contact us at:'
            )} <span className="text-gold">support@premiumstore.fr</span> {t('ou via notre', 'or via our')}{' '}
            <Link href="/support" className="text-gold hover:text-gold-light transition-colors">
              {t('page support', 'support page')}
            </Link>.
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
