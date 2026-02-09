'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/context/LanguageContext'

type Message = {
  id: number
  role: 'user' | 'bot'
  text: string
  links?: { text: string; url: string }[]
  suggestions?: string[]
}

type FaqEntry = { keywords: string[]; answer: string; links?: { text: string; url: string }[]; suggestions?: string[] }

const FAQ_FR: FaqEntry[] = [
  {
    keywords: ['figurine', 'figurines', '3d', 'personnalise', 'custom', 'creer', 'creation', 'modele'],
    answer: "Vous pouvez creer votre propre figurine 3D personnalisee ! Deux options : a partir d'un texte descriptif ou d'une image. La generation prend quelques minutes et votre figurine sera prete a commander pour impression 3D (49.99 EUR).",
    links: [{ text: 'Creer ma figurine', url: '/create-figurine' }, { text: 'Voir mes figurines', url: '/my-figurines' }],
    suggestions: ['Comment créer une figurine ?', 'Prix impression 3D', 'Délai de génération'],
  },
  {
    keywords: ['comment creer', 'creer figurine', 'faire figurine', 'fabriquer'],
    answer: "Pour creer une figurine : 1) Allez sur la page Creation de figurine. 2) Choisissez le mode (Texte ou Image). 3) Decrivez votre figurine ou uploadez une photo. 4) Selectionnez le style et les couleurs. 5) Lancez la generation ! Une fois prete, vous pouvez la commander pour impression 3D.",
    links: [{ text: 'Creer maintenant', url: '/create-figurine' }],
    suggestions: ['Prix impression 3D', 'Voir exemples', 'Support technique'],
  },
  {
    keywords: ['impression 3d', 'imprimer', 'commander figurine', 'prix figurine'],
    answer: "L'impression 3D de votre figurine personnalisee coute 49.99 EUR. Ce prix inclut l'impression haute qualite, les finitions et la preparation pour l'expedition. Delai : 3-5 jours ouvres apres validation de la commande.",
    links: [{ text: 'Voir mes figurines', url: '/my-figurines' }],
    suggestions: ['Livraison', 'Qualité impression', 'Matériaux utilisés'],
  },
  {
    keywords: ['delai generation', 'combien de temps', 'duree', 'attente', 'generation'],
    answer: "La generation d'une figurine 3D prend generalement 5 a 15 minutes. Le processus comporte deux etapes : generation du modele (preview) puis texturation. Vous pouvez suivre la progression en temps reel sur la page de vos figurines.",
    links: [{ text: 'Mes figurines', url: '/my-figurines' }],
    suggestions: ['Voir le statut', 'Créer une figurine', 'Support'],
  },
  {
    keywords: ['texture', 'couleur', 'style', 'realiste', 'cartoon'],
    answer: "Vous pouvez choisir parmi 4 styles : Realiste, Cartoon, Sculpture, ou Low-Poly. Les couleurs et textures sont automatiquement appliquees selon votre description. Pour les figurines a partir d'images, les textures PBR (Physically Based Rendering) sont incluses pour un rendu ultra-realiste.",
    links: [{ text: 'Creer avec style', url: '/create-figurine' }],
    suggestions: ['Voir exemples', 'Comment décrire ma figurine ?', 'Prix'],
  },
  {
    keywords: ['livraison', 'livrer', 'delai', 'expedition', 'shipping', 'envoi'],
    answer: "Nous livrons en 3 a 5 jours ouvres en France metropolitaine. Les frais de livraison sont offerts a partir de 50 EUR d'achat. Pour les figurines 3D personnalisees, comptez 3-5 jours supplementaires pour l'impression.",
    links: [{ text: 'Suivre mes commandes', url: '/orders' }],
    suggestions: ['Retours', 'Suivi de commande', 'Livraison internationale'],
  },
  {
    keywords: ['retour', 'rembourser', 'remboursement', 'echanger', 'echange'],
    answer: 'Vous disposez de 14 jours apres reception pour retourner un article (hors figurines personnalisees). Le remboursement est effectue sous 5 jours ouvres apres reception du retour. Note : les figurines 3D personnalisees ne peuvent etre retournees car elles sont uniques.',
    links: [{ text: 'Mes commandes', url: '/orders' }, { text: 'Support', url: '/support' }],
    suggestions: ['Politique de retour', 'Remboursement', 'Contact support'],
  },
  {
    keywords: ['paiement', 'payer', 'carte', 'paypal', 'stripe', 'visa', 'mastercard'],
    answer: 'Nous acceptons les paiements par carte bancaire (Visa, Mastercard via Stripe) et PayPal. Toutes les transactions sont securisees SSL. Le paiement est effectue au moment de la commande.',
    links: [{ text: 'Passer commande', url: '/cart' }],
    suggestions: ['Sécurité', 'Facture', 'Code promo'],
  },
  {
    keywords: ['commande', 'suivi', 'suivre', 'track', 'statut', 'status', 'ou est'],
    answer: 'Vous pouvez suivre vos commandes dans la section "Mes commandes" de votre compte. Vous y trouverez le statut en temps reel : En attente, Payee, Expediee, ou Livree. Vous recevrez egalement des notifications par email.',
    links: [{ text: 'Mes commandes', url: '/orders' }],
    suggestions: ['Livraison', 'Problème commande', 'Facture'],
  },
  {
    keywords: ['compte', 'inscription', 'inscrire', 'connexion', 'connecter', 'mot de passe', 'password'],
    answer: `Creez votre compte via la page d'inscription. Si vous avez oublie votre mot de passe, utilisez la fonction "Mot de passe oublie" sur la page de connexion. Avec un compte, vous pouvez suivre vos commandes, creer des figurines, et enregistrer vos adresses.`,
    links: [{ text: 'Se connecter', url: '/login' }, { text: "S'inscrire", url: '/register' }],
    suggestions: ['Mes commandes', 'Mon compte', 'Sécurité'],
  },
  {
    keywords: ['promo', 'code promo', 'reduction', 'coupon', 'remise', 'solde'],
    answer: "Vous pouvez entrer votre code promo lors du passage en caisse dans le panier. Les reductions sont appliquees automatiquement. Abonnez-vous a notre newsletter pour recevoir des codes exclusifs !",
    links: [{ text: 'Mon panier', url: '/cart' }],
    suggestions: ['Codes disponibles', 'Newsletter', 'Offres'],
  },
  {
    keywords: ['stock', 'disponible', 'rupture', 'sold out', 'dispo'],
    answer: 'Si un produit est en rupture de stock, il sera marque "Sold Out". Vous pouvez consulter regulierement notre boutique pour voir les reapprovisionnements. Les figurines personnalisees sont toujours disponibles car generees a la demande.',
    links: [{ text: 'Boutique', url: '/shop' }],
    suggestions: ['Nouveautés', 'Créer une figurine', 'Notifications'],
  },
  {
    keywords: ['contact', 'email', 'telephone', 'support', 'aide', 'help', 'ticket', 'probleme'],
    answer: 'Vous pouvez creer un ticket support directement depuis la page Support. Notre equipe vous repondra sous 24h. Pour les questions urgentes, utilisez ce chat ou consultez notre FAQ complete.',
    links: [{ text: 'Creer un ticket', url: '/support' }],
    suggestions: ['FAQ', 'Urgence', 'Horaires support'],
  },
  {
    keywords: ['prix', 'tarif', 'cher', 'cout', 'combien'],
    answer: 'Nos prix sont affiches TTC sur chaque fiche produit. Les figurines personnalisees 3D coutent 49.99 EUR (impression incluse). Les frais de livraison sont calcules au moment du paiement et offerts des 50 EUR d\'achat.',
    links: [{ text: 'Voir les produits', url: '/shop' }, { text: 'Creer figurine', url: '/create-figurine' }],
    suggestions: ['Livraison gratuite', 'Code promo', 'Paiement'],
  },
  {
    keywords: ['qualite', 'materiau', 'matiere', 'resolution', 'detail'],
    answer: "Nos figurines 3D sont imprimees en resine haute qualite avec une resolution de 50 microns. Les details sont ultra-precis et les textures PBR donnent un rendu photoréaliste. Finitions professionnelles incluses.",
    links: [{ text: 'Creer ma figurine', url: '/create-figurine' }],
    suggestions: ['Voir exemples', 'Prix impression', 'Styles disponibles'],
  },
  {
    keywords: ['boutique', 'produit', 'catalogue', 'shop', 'acheter'],
    answer: "Decouvrez notre catalogue de produits dans la Boutique ! Nous proposons des figurines classiques en stock ET la possibilite de creer vos propres figurines 3D personnalisees. Livraison rapide garantie.",
    links: [{ text: 'Boutique', url: '/shop' }, { text: 'Figurines perso', url: '/create-figurine' }],
    suggestions: ['Nouveautés', 'Prix', 'Stock'],
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'bonsoir'],
    answer: "Bonjour ! Je suis votre assistant Premium Store. Je peux vous renseigner sur nos produits, les figurines 3D personnalisees, la livraison, les retours et bien plus ! Comment puis-je vous aider ?",
    suggestions: ['Créer une figurine', 'Voir la boutique', 'Suivre ma commande'],
  },
  {
    keywords: ['merci', 'thanks', 'parfait', 'super', 'genial', 'top'],
    answer: "Avec plaisir ! N'hesitez pas si vous avez d'autres questions. Bonne navigation sur Premium Store !",
    suggestions: ['Créer une figurine', 'Boutique', 'Mon compte'],
  },
]

const FAQ_EN: FaqEntry[] = [
  {
    keywords: ['figurine', 'figurines', '3d', 'custom', 'personalize', 'create', 'creation', 'model'],
    answer: "You can create your own custom 3D figurine! Two options: from a text description or an image. Generation takes a few minutes and your figurine will be ready to order for 3D printing (49.99 EUR).",
    links: [{ text: 'Create my figurine', url: '/create-figurine' }, { text: 'View my figurines', url: '/my-figurines' }],
    suggestions: ['How to create a figurine?', '3D printing price', 'Generation time'],
  },
  {
    keywords: ['how create', 'create figurine', 'make figurine', 'build'],
    answer: "To create a figurine: 1) Go to the Figurine Creation page. 2) Choose mode (Text or Image). 3) Describe your figurine or upload a photo. 4) Select style and colors. 5) Start generation! Once ready, you can order it for 3D printing.",
    links: [{ text: 'Create now', url: '/create-figurine' }],
    suggestions: ['3D printing price', 'View examples', 'Technical support'],
  },
  {
    keywords: ['3d print', 'printing', 'order figurine', 'figurine price'],
    answer: "3D printing of your custom figurine costs 49.99 EUR. This price includes high-quality printing, finishing touches, and shipping preparation. Delivery: 3-5 business days after order confirmation.",
    links: [{ text: 'View my figurines', url: '/my-figurines' }],
    suggestions: ['Shipping', 'Print quality', 'Materials used'],
  },
  {
    keywords: ['generation time', 'how long', 'duration', 'wait', 'generating'],
    answer: "Generating a 3D figurine usually takes 5 to 15 minutes. The process has two steps: model generation (preview) then texturing. You can track progress in real-time on your figurines page.",
    links: [{ text: 'My figurines', url: '/my-figurines' }],
    suggestions: ['Check status', 'Create figurine', 'Support'],
  },
  {
    keywords: ['texture', 'color', 'style', 'realistic', 'cartoon'],
    answer: "You can choose from 4 styles: Realistic, Cartoon, Sculpture, or Low-Poly. Colors and textures are automatically applied based on your description. For image-based figurines, PBR (Physically Based Rendering) textures are included for ultra-realistic results.",
    links: [{ text: 'Create with style', url: '/create-figurine' }],
    suggestions: ['View examples', 'How to describe?', 'Price'],
  },
  {
    keywords: ['shipping', 'deliver', 'delivery', 'dispatch', 'send'],
    answer: 'We deliver in 3 to 5 business days in mainland France. Shipping is free for orders over 50 EUR. For custom 3D figurines, allow 3-5 additional days for printing.',
    links: [{ text: 'Track my orders', url: '/orders' }],
    suggestions: ['Returns', 'Order tracking', 'International shipping'],
  },
  {
    keywords: ['return', 'refund', 'exchange'],
    answer: 'You have 14 days after delivery to return an item (except custom figurines). Refunds are issued within 5 business days. Note: Custom 3D figurines cannot be returned as they are unique.',
    links: [{ text: 'My orders', url: '/orders' }, { text: 'Support', url: '/support' }],
    suggestions: ['Return policy', 'Refund', 'Contact support'],
  },
  {
    keywords: ['payment', 'pay', 'card', 'paypal', 'stripe', 'visa', 'mastercard'],
    answer: 'We accept card payments (Visa, Mastercard via Stripe) and PayPal. All transactions are SSL secured. Payment is processed at checkout.',
    links: [{ text: 'Checkout', url: '/cart' }],
    suggestions: ['Security', 'Invoice', 'Promo code'],
  },
  {
    keywords: ['order', 'track', 'tracking', 'status', 'where is'],
    answer: 'You can track your orders in the "My orders" section of your account. Real-time status: Pending, Paid, Shipped, or Delivered. You will also receive email notifications.',
    links: [{ text: 'My orders', url: '/orders' }],
    suggestions: ['Shipping', 'Order issue', 'Invoice'],
  },
  {
    keywords: ['account', 'signup', 'sign up', 'login', 'log in', 'password'],
    answer: 'Create your account via the sign up page. If you forgot your password, use the "Forgot password" option. With an account, you can track orders, create figurines, and save addresses.',
    links: [{ text: 'Login', url: '/login' }, { text: 'Sign up', url: '/register' }],
    suggestions: ['My orders', 'My account', 'Security'],
  },
  {
    keywords: ['promo', 'promo code', 'discount', 'coupon', 'sale'],
    answer: 'You can enter your promo code at checkout in the cart. Discounts are applied automatically. Subscribe to our newsletter for exclusive codes!',
    links: [{ text: 'My cart', url: '/cart' }],
    suggestions: ['Available codes', 'Newsletter', 'Offers'],
  },
  {
    keywords: ['stock', 'available', 'out of stock', 'sold out'],
    answer: 'If a product is out of stock, it will be marked "Sold Out". Check our shop regularly for restocks. Custom figurines are always available as they are generated on demand.',
    links: [{ text: 'Shop', url: '/shop' }],
    suggestions: ['New arrivals', 'Create figurine', 'Notifications'],
  },
  {
    keywords: ['contact', 'email', 'phone', 'support', 'help', 'ticket', 'issue'],
    answer: 'You can create a support ticket directly from the Support page. Our team will reply within 24h. For urgent questions, use this chat or check our complete FAQ.',
    links: [{ text: 'Create ticket', url: '/support' }],
    suggestions: ['FAQ', 'Urgent', 'Support hours'],
  },
  {
    keywords: ['price', 'cost', 'how much'],
    answer: 'Our prices include VAT on each product page. Custom 3D figurines cost 49.99 EUR (printing included). Shipping costs are calculated at checkout and free over 50 EUR.',
    links: [{ text: 'View products', url: '/shop' }, { text: 'Create figurine', url: '/create-figurine' }],
    suggestions: ['Free shipping', 'Promo code', 'Payment'],
  },
  {
    keywords: ['quality', 'material', 'resolution', 'detail'],
    answer: "Our 3D figurines are printed in high-quality resin with 50-micron resolution. Details are ultra-precise and PBR textures provide photorealistic rendering. Professional finishing included.",
    links: [{ text: 'Create my figurine', url: '/create-figurine' }],
    suggestions: ['View examples', 'Print price', 'Available styles'],
  },
  {
    keywords: ['shop', 'product', 'catalog', 'buy'],
    answer: "Discover our product catalog in the Shop! We offer classic figurines in stock AND the ability to create your own custom 3D figurines. Fast delivery guaranteed.",
    links: [{ text: 'Shop', url: '/shop' }, { text: 'Custom figurines', url: '/create-figurine' }],
    suggestions: ['New arrivals', 'Price', 'Stock'],
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    answer: "Hello! I'm your Premium Store assistant. I can help with products, custom 3D figurines, shipping, returns, and more! How can I help you?",
    suggestions: ['Create a figurine', 'View shop', 'Track my order'],
  },
  {
    keywords: ['thanks', 'thank you', 'great', 'perfect', 'awesome'],
    answer: 'You are welcome! Feel free to ask if you have more questions. Enjoy browsing Premium Store!',
    suggestions: ['Create a figurine', 'Shop', 'My account'],
  },
]

const FALLBACK_FR = 'Je ne suis pas sur de comprendre votre question. Vous pouvez creer un ticket support pour obtenir une reponse personnalisee de notre equipe : rendez-vous sur la page Support (/support). Sinon, essayez de me demander des informations sur la livraison, les retours, le paiement ou le stock.'
const FALLBACK_EN = "I'm not sure I understand your question. You can create a support ticket to get a personalized reply from our team: go to the Support page (/support). Otherwise, try asking about shipping, returns, payment, or stock."

function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

type Answer = {
  text: string
  links?: { text: string; url: string }[]
  suggestions?: string[]
}

function findAnswer(input: string, faq: FaqEntry[], fallback: string): Answer {
  const lower = normalizeText(input)
  const words = lower.split(/\s+/)

  let bestMatch: { entry: FaqEntry; score: number } | null = null

  for (const entry of faq) {
    let score = 0
    let matchedKeywords = 0

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword)

      // Correspondance exacte du mot-clé
      if (lower.includes(normalizedKeyword)) {
        score += 10
        matchedKeywords++
      }

      // Correspondance partielle (mots individuels)
      for (const word of words) {
        if (word.length > 2 && normalizedKeyword.includes(word)) {
          score += 2
          matchedKeywords++
        }
      }
    }

    // Bonus pour plusieurs mots-clés trouvés
    if (matchedKeywords > 1) {
      score += matchedKeywords * 3
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score }
    }
  }

  if (bestMatch && bestMatch.score >= 10) {
    return {
      text: bestMatch.entry.answer,
      links: bestMatch.entry.links,
      suggestions: bestMatch.entry.suggestions,
    }
  }

  return { text: fallback }
}

export default function Chatbot() {
  const { t, locale } = useI18n()
  const faq = locale === 'fr' ? FAQ_FR : FAQ_EN
  const fallback = locale === 'fr' ? FALLBACK_FR : FALLBACK_EN
  const quickActions = locale === 'fr'
    ? ['Créer une figurine', 'Livraison', 'Prix', 'Support']
    : ['Create figurine', 'Shipping', 'Price', 'Support']

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'bot',
      text: locale === 'fr'
        ? "Bonjour ! Je suis l'assistant Premium Store. Comment puis-je vous aider ?"
        : 'Hello! I am the Premium Store assistant. How can I help you?',
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  let nextId = useRef(1)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 0) {
        return [
          {
            ...prev[0],
            text: locale === 'fr'
              ? "Bonjour ! Je suis l'assistant Premium Store. Comment puis-je vous aider ?"
              : 'Hello! I am the Premium Store assistant. How can I help you?',
          },
        ]
      }
      return prev
    })
  }, [locale])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: nextId.current++, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(text, faq, fallback)
      const botMsg: Message = {
        id: nextId.current++,
        role: 'bot',
        text: answer.text,
        links: answer.links,
        suggestions: answer.suggestions,
      }
      setMessages((prev) => [...prev, botMsg])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-dark flex items-center justify-center shadow-lg hover:bg-gold-light transition-colors"
        aria-label={t('Ouvrir le chat', 'Open chat')}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Fenetre de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-dark-secondary border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-sm font-bold">PS</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Premium Store</p>
                <p className="text-xs text-green-400">{t('En ligne', 'Online')}</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold text-dark rounded-br-md'
                        : 'bg-white/10 text-gray-200 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'bot' && msg.links && msg.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[80%]">
                      {msg.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${link.url}`}
                          className="text-xs px-3 py-1.5 rounded-full bg-gold/20 text-gold hover:bg-gold/30 transition-colors flex items-center gap-1"
                          onClick={() => setOpen(false)}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                  {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-col gap-1 max-w-[80%]">
                      <span className="text-xs text-gray-500 px-1">{t('Questions liees :', 'Related questions:')}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const userMsg: Message = { id: nextId.current++, role: 'user', text: suggestion }
                              setMessages((prev) => [...prev, userMsg])
                              setTimeout(() => {
                                const answer = findAnswer(suggestion, faq, fallback)
                                const botMsg: Message = {
                                  id: nextId.current++,
                                  role: 'bot',
                                  text: answer.text,
                                  links: answer.links,
                                  suggestions: answer.suggestions,
                                }
                                setMessages((prev) => [...prev, botMsg])
                              }, 500)
                            }}
                            className="text-xs px-2 py-1 rounded-full border border-white/20 text-gray-400 hover:text-gold hover:border-gold/30 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {quickActions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                    setTimeout(() => {
                      const userMsg: Message = { id: nextId.current++, role: 'user', text: q }
                      setMessages((prev) => [...prev, userMsg])
                      setInput('')
                      setTimeout(() => {
                        const answer = findAnswer(q, faq, fallback)
                        const botMsg: Message = {
                          id: nextId.current++,
                          role: 'bot',
                          text: answer.text,
                          links: answer.links,
                          suggestions: answer.suggestions,
                        }
                        setMessages((prev) => [...prev, botMsg])
                      }, 500)
                    }, 100)
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10 flex gap-2">
              <input
                ref={inputRef}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gold/50 transition-colors"
                placeholder={t('Tapez votre message...', 'Type your message...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-gold text-dark flex items-center justify-center hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
