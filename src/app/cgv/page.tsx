'use client'

import Link from 'next/link'
import { useI18n } from '@/context/LanguageContext'

export default function CGVPage() {
  const { t, localeTag } = useI18n()

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1 className="text-3xl font-bold mb-2">
          {t('Conditions Generales de', 'Terms and Conditions of')} <span className="text-gold">{t('Vente', 'Sale')}</span>
        </h1>
        <p className="text-gray-500 text-sm mb-10">{t('Derniere mise a jour :', 'Last updated:')} {new Date().toLocaleDateString(localeTag)}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 1 - Objet', 'Article 1 - Purpose')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Les presentes Conditions Generales de Vente (CGV) regissent les ventes de produits effectuees sur le site Premium Store. Toute commande implique l'acceptation sans reserve des presentes CGV.",
              'These Terms and Conditions of Sale govern product sales on the Premium Store website. Any order implies acceptance of these terms without reservation.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 2 - Produits', 'Article 2 - Products')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              'Les produits proposes sont ceux qui figurent sur le site au moment de la consultation. Les photographies et descriptions des produits sont les plus fideles possibles mais ne peuvent assurer une similitude parfaite avec le produit propose. Premium Store se reserve le droit de modifier ses produits a tout moment.',
              'The products offered are those shown on the site at the time of viewing. Photographs and descriptions are as accurate as possible but cannot guarantee perfect similarity with the product offered. Premium Store reserves the right to modify its products at any time.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 3 - Prix', 'Article 3 - Prices')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Les prix sont indiques en euros TTC (toutes taxes comprises). Premium Store se reserve le droit de modifier ses prix a tout moment, etant entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable a l'acheteur. Les frais de livraison sont calcules au moment de la commande.",
              'Prices are shown in euros including VAT. Premium Store reserves the right to change prices at any time, with the price listed on the day of the order being the only applicable price to the buyer. Shipping costs are calculated at the time of order.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 4 - Commande', 'Article 4 - Order')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "L'acheteur passe commande sur le site en ajoutant des produits a son panier puis en procedant au paiement. La commande n'est definitive qu'apres confirmation du paiement. Un email de confirmation est envoye a l'acheteur. Premium Store se reserve le droit d'annuler toute commande en cas de probleme de paiement ou de stock insuffisant.",
              'The buyer places an order on the site by adding products to the cart and proceeding to payment. The order is final only after payment confirmation. A confirmation email is sent to the buyer. Premium Store reserves the right to cancel any order in case of payment issues or insufficient stock.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 5 - Paiement', 'Article 5 - Payment')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Le paiement s'effectue par carte bancaire via Stripe ou via PayPal. Le paiement est securise et les donnees bancaires ne sont pas stockees sur nos serveurs. La commande est validee a la reception du paiement integral.`,
              'Payment is made by card via Stripe or via PayPal. Payment is secure and card data is not stored on our servers. The order is validated upon receipt of full payment.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 6 - Livraison', 'Article 6 - Shipping')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Les produits sont livres en France metropolitaine dans un delai de 3 a 5 jours ouvres a compter de la confirmation de la commande. Les frais de livraison sont offerts a partir de 50 euros d'achat. Premium Store ne saurait etre tenu responsable des retards de livraison dus au transporteur.`,
              'Products are delivered in mainland France within 3 to 5 business days from order confirmation. Shipping is free for orders over 50 euros. Premium Store cannot be held responsible for delivery delays due to the carrier.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 7 - Droit de retractation', 'Article 7 - Right of withdrawal')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              "Conformement a l'article L221-18 du Code de la consommation, l'acheteur dispose d'un delai de 14 jours a compter de la reception du produit pour exercer son droit de retractation sans avoir a justifier de motifs ni a payer de penalites. Le produit doit etre retourne dans son etat d'origine et complet. Le remboursement est effectue dans un delai de 14 jours suivant la reception du retour.",
              'In accordance with Article L221-18 of the French Consumer Code, the buyer has 14 days from receipt of the product to exercise the right of withdrawal without having to justify reasons or pay penalties. The product must be returned in its original condition and complete. The refund is made within 14 days following receipt of the return.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 8 - Garanties', 'Article 8 - Warranties')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Tous les produits beneficient de la garantie legale de conformite (articles L217-4 et suivants du Code de la consommation) et de la garantie des vices caches (articles 1641 et suivants du Code civil). En cas de defaut, l'acheteur peut demander la reparation ou le remplacement du produit.`,
              'All products benefit from the legal guarantee of conformity (Articles L217-4 and following of the French Consumer Code) and the warranty against hidden defects (Articles 1641 and following of the French Civil Code). In case of defect, the buyer may request repair or replacement of the product.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 9 - Litiges', 'Article 9 - Disputes')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Les presentes CGV sont soumises au droit francais. En cas de litige, une solution amiable sera recherchee avant toute action judiciaire. A defaut, les tribunaux francais seront seuls competents. Conformement a l'article L612-1 du Code de la consommation, le consommateur peut recourir a un mediateur de la consommation.`,
              'These terms are governed by French law. In case of dispute, an amicable solution will be sought before any legal action. Failing that, the French courts shall have exclusive jurisdiction. In accordance with Article L612-1 of the French Consumer Code, the consumer may use a consumer mediator.'
            )}
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('Article 10 - Donnees personnelles', 'Article 10 - Personal data')}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t(
              `Les informations collectees font l'objet d'un traitement informatique conforme au RGPD. Pour en savoir plus, consultez notre`,
              'The information collected is processed in accordance with GDPR. For more information, see our'
            )}{' '}
            <Link href="/confidentialite" className="text-gold hover:text-gold-light transition-colors">
              {t('politique de confidentialite', 'privacy policy')}
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
