'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: number
  role: 'user' | 'bot'
  text: string
}

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['livraison', 'livrer', 'delai', 'expédition', 'expedition', 'shipping', 'envoi'],
    answer: 'Nous livrons en 3 a 5 jours ouvrés en France métropolitaine. Les frais de livraison sont offerts a partir de 50€ d\'achat.',
  },
  {
    keywords: ['retour', 'rembourser', 'remboursement', 'echanger', 'echange'],
    answer: 'Vous disposez de 14 jours apres réception pour retourner un article. Le remboursement est effectue sous 5 jours ouvrés apres réception du retour.',
  },
  {
    keywords: ['paiement', 'payer', 'carte', 'paypal', 'stripe', 'visa', 'mastercard'],
    answer: 'Nous acceptons les paiements par carte bancaire (via Stripe) et PayPal. Toutes les transactions sont sécurisées.',
  },
  {
    keywords: ['commande', 'suivi', 'suivre', 'track', 'statut', 'status', 'ou est'],
    answer: 'Vous pouvez suivre vos commandes dans la section "Mes commandes" de votre compte. Vous y trouverez le statut en temps réel.',
  },
  {
    keywords: ['compte', 'inscription', 'inscrire', 'connexion', 'connecter', 'mot de passe', 'password'],
    answer: 'Créez votre compte via la page d\'inscription. Si vous avez oublié votre mot de passe, utilisez la fonction "Mot de passe oublié" sur la page de connexion.',
  },
  {
    keywords: ['promo', 'code promo', 'reduction', 'coupon', 'remise', 'solde'],
    answer: 'Vous pouvez entrer votre code promo lors du passage en caisse dans le panier. Les réductions sont appliquées automatiquement.',
  },
  {
    keywords: ['stock', 'disponible', 'rupture', 'sold out', 'dispo'],
    answer: 'Si un produit est en rupture de stock, il sera marqué "Sold Out". Vous pouvez consulter régulièrement notre boutique pour voir les réapprovisionnements.',
  },
  {
    keywords: ['contact', 'email', 'telephone', 'support', 'aide', 'help', 'ticket', 'probleme'],
    answer: 'Vous pouvez creer un ticket support directement depuis la page /support. Notre equipe vous repondra dans les plus brefs delais. Vous pouvez aussi utiliser ce chat pour les questions frequentes.',
  },
  {
    keywords: ['prix', 'tarif', 'cher', 'cout', 'combien'],
    answer: 'Nos prix sont affichés TTC sur chaque fiche produit. Les frais de livraison sont calculés au moment du paiement.',
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'bonsoir'],
    answer: 'Bonjour ! Comment puis-je vous aider ? N\'hésitez pas a me poser vos questions sur nos produits, la livraison, les retours ou le paiement.',
  },
  {
    keywords: ['merci', 'thanks', 'parfait', 'super', 'genial', 'top'],
    answer: 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions. Bonne navigation sur Premium Store !',
  },
]

function findAnswer(input: string): string {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const faq of FAQ) {
    for (const keyword of faq.keywords) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (lower.includes(normalizedKeyword)) {
        return faq.answer
      }
    }
  }

  return 'Je ne suis pas sur de comprendre votre question. Vous pouvez creer un ticket support pour obtenir une reponse personnalisee de notre equipe : rendez-vous sur la page Support (/support). Sinon, essayez de me demander des informations sur la livraison, les retours, le paiement ou le stock.'
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'bot', text: 'Bonjour ! Je suis l\'assistant Premium Store. Comment puis-je vous aider ?' },
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

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: nextId.current++, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(text)
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
        aria-label="Ouvrir le chat"
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
                <p className="text-xs text-green-400">En ligne</p>
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
              {['Livraison', 'Retours', 'Paiement', 'Support'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                    setTimeout(() => {
                      const userMsg: Message = { id: nextId.current++, role: 'user', text: q }
                      setMessages((prev) => [...prev, userMsg])
                      setInput('')
                      setTimeout(() => {
                        const answer = findAnswer(q)
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
                placeholder="Tapez votre message..."
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
