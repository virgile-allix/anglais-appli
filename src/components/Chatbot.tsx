'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/context/LanguageContext'

type Message = {
  id: number
  role: 'user' | 'bot'
  text: string
}

type FaqEntry = { keywords: string[]; answer: string }

const FAQ_FR: FaqEntry[] = [
  {
    keywords: ['livraison', 'livrer', 'delai', 'expedition', 'shipping', 'envoi'],
    answer: "Nous livrons en 3 a 5 jours ouvres en France metropolitaine. Les frais de livraison sont offerts a partir de 50 EUR d'achat.",
  },
  {
    keywords: ['retour', 'rembourser', 'remboursement', 'echanger', 'echange'],
    answer: 'Vous disposez de 14 jours apres reception pour retourner un article. Le remboursement est effectue sous 5 jours ouvres apres reception du retour.',
  },
  {
    keywords: ['paiement', 'payer', 'carte', 'paypal', 'stripe', 'visa', 'mastercard'],
    answer: 'Nous acceptons les paiements par carte bancaire (via Stripe) et PayPal. Toutes les transactions sont securisees.',
  },
  {
    keywords: ['commande', 'suivi', 'suivre', 'track', 'statut', 'status', 'ou est'],
    answer: 'Vous pouvez suivre vos commandes dans la section "Mes commandes" de votre compte. Vous y trouverez le statut en temps reel.',
  },
  {
    keywords: ['compte', 'inscription', 'inscrire', 'connexion', 'connecter', 'mot de passe', 'password'],
    answer: `Creez votre compte via la page d'inscription. Si vous avez oublie votre mot de passe, utilisez la fonction "Mot de passe oublie" sur la page de connexion.`,
  },
  {
    keywords: ['promo', 'code promo', 'reduction', 'coupon', 'remise', 'solde'],
    answer: "Vous pouvez entrer votre code promo lors du passage en caisse dans le panier. Les reductions sont appliquees automatiquement.",
  },
  {
    keywords: ['stock', 'disponible', 'rupture', 'sold out', 'dispo'],
    answer: 'Si un produit est en rupture de stock, il sera marque "Sold Out". Vous pouvez consulter regulierement notre boutique pour voir les reapprovisionnements.',
  },
  {
    keywords: ['contact', 'email', 'telephone', 'support', 'aide', 'help', 'ticket', 'probleme'],
    answer: 'Vous pouvez creer un ticket support directement depuis la page /support. Notre equipe vous repondra dans les plus brefs delais. Vous pouvez aussi utiliser ce chat pour les questions frequentes.',
  },
  {
    keywords: ['prix', 'tarif', 'cher', 'cout', 'combien'],
    answer: 'Nos prix sont affiches TTC sur chaque fiche produit. Les frais de livraison sont calcules au moment du paiement.',
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'bonsoir'],
    answer: "Bonjour ! Comment puis-je vous aider ? N'hesitez pas a me poser vos questions sur nos produits, la livraison, les retours ou le paiement.",
  },
  {
    keywords: ['merci', 'thanks', 'parfait', 'super', 'genial', 'top'],
    answer: "Avec plaisir ! N'hesitez pas si vous avez d'autres questions. Bonne navigation sur Premium Store !",
  },
]

const FAQ_EN: FaqEntry[] = [
  {
    keywords: ['shipping', 'deliver', 'delivery', 'dispatch', 'send'],
    answer: 'We deliver in 3 to 5 business days in mainland France. Shipping is free for orders over 50 EUR.',
  },
  {
    keywords: ['return', 'refund', 'exchange'],
    answer: 'You have 14 days after delivery to return an item. Refunds are issued within 5 business days after receiving the return.',
  },
  {
    keywords: ['payment', 'pay', 'card', 'paypal', 'stripe', 'visa', 'mastercard'],
    answer: 'We accept card payments (via Stripe) and PayPal. All transactions are secure.',
  },
  {
    keywords: ['order', 'track', 'tracking', 'status', 'where is'],
    answer: 'You can track your orders in the "My orders" section of your account. You will find real-time status updates there.',
  },
  {
    keywords: ['account', 'signup', 'sign up', 'login', 'log in', 'password'],
    answer: 'Create your account via the sign up page. If you forgot your password, use the "Forgot password" option on the login page.',
  },
  {
    keywords: ['promo', 'promo code', 'discount', 'coupon', 'sale'],
    answer: 'You can enter your promo code at checkout in the cart. Discounts are applied automatically.',
  },
  {
    keywords: ['stock', 'available', 'out of stock', 'sold out'],
    answer: 'If a product is out of stock, it will be marked "Sold Out". Check our shop regularly for restocks.',
  },
  {
    keywords: ['contact', 'email', 'phone', 'support', 'help', 'ticket', 'issue'],
    answer: 'You can create a support ticket directly from the /support page. Our team will get back to you as soon as possible. You can also use this chat for FAQs.',
  },
  {
    keywords: ['price', 'cost', 'how much'],
    answer: 'Our prices are displayed including VAT on each product page. Shipping costs are calculated at checkout.',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    answer: 'Hello! How can I help you? Feel free to ask about products, shipping, returns, or payment.',
  },
  {
    keywords: ['thanks', 'thank you', 'great', 'perfect', 'awesome'],
    answer: 'You are welcome! Feel free to ask if you have more questions. Enjoy browsing Premium Store!',
  },
]

const FALLBACK_FR = 'Je ne suis pas sur de comprendre votre question. Vous pouvez creer un ticket support pour obtenir une reponse personnalisee de notre equipe : rendez-vous sur la page Support (/support). Sinon, essayez de me demander des informations sur la livraison, les retours, le paiement ou le stock.'
const FALLBACK_EN = "I'm not sure I understand your question. You can create a support ticket to get a personalized reply from our team: go to the Support page (/support). Otherwise, try asking about shipping, returns, payment, or stock."

function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function findAnswer(input: string, faq: FaqEntry[], fallback: string): string {
  const lower = normalizeText(input)

  for (const entry of faq) {
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword)
      if (lower.includes(normalizedKeyword)) {
        return entry.answer
      }
    }
  }

  return fallback
}

export default function Chatbot() {
  const { t, locale } = useI18n()
  const faq = locale === 'fr' ? FAQ_FR : FAQ_EN
  const fallback = locale === 'fr' ? FALLBACK_FR : FALLBACK_EN
  const quickActions = locale === 'fr'
    ? ['Livraison', 'Retours', 'Paiement', 'Support']
    : ['Shipping', 'Returns', 'Payment', 'Support']

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
      const botMsg: Message = { id: nextId.current++, role: 'bot', text: answer }
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
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                        const botMsg: Message = { id: nextId.current++, role: 'bot', text: answer }
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
