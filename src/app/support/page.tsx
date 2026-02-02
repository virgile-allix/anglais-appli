'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  createTicket,
  getUserTickets,
  addTicketMessage,
  type Ticket,
} from '@/lib/firestore'

const STATUS_LABELS: Record<Ticket['status'], { label: string; color: string }> = {
  open: { label: 'Ouvert', color: 'text-green-400 bg-green-400/10' },
  in_progress: { label: 'En cours', color: 'text-yellow-400 bg-yellow-400/10' },
  closed: { label: 'Ferme', color: 'text-gray-400 bg-gray-400/10' },
}

export default function SupportPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Nouveau ticket
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)

  // Ticket ouvert (conversation)
  const [openTicketId, setOpenTicketId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!error && !success) return
    const t = setTimeout(() => { setError(''); setSuccess('') }, 4000)
    return () => clearTimeout(t)
  }, [error, success])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    getUserTickets(user.uid)
      .then(setTickets)
      .catch(() => setError('Erreur chargement tickets'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    if (!subject.trim() || !message.trim()) {
      setError('Sujet et message requis.')
      return
    }

    setCreating(true)
    setError('')
    try {
      const id = await createTicket({
        uid: user.uid,
        email: profile.email,
        subject: subject.trim(),
        status: 'open',
        messages: [
          {
            sender: 'client',
            senderEmail: profile.email,
            text: message.trim(),
            createdAt: new Date(),
          },
        ],
      })

      const newTicket: Ticket = {
        id,
        uid: user.uid,
        email: profile.email,
        subject: subject.trim(),
        status: 'open',
        messages: [
          {
            sender: 'client',
            senderEmail: profile.email,
            text: message.trim(),
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setTickets((prev) => [newTicket, ...prev])
      setSubject('')
      setMessage('')
      setSuccess('Ticket cree ! Notre equipe va vous repondre.')
      setOpenTicketId(id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur creation ticket')
    } finally {
      setCreating(false)
    }
  }

  const handleReply = async (ticketId: string) => {
    if (!user || !profile) return
    if (!reply.trim()) return

    setSending(true)
    try {
      await addTicketMessage(ticketId, {
        sender: 'client',
        senderEmail: profile.email,
        text: reply.trim(),
      })

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    sender: 'client' as const,
                    senderEmail: profile.email,
                    text: reply.trim(),
                    createdAt: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            : t
        )
      )
      setReply('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur envoi message')
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const openTicket = tickets.find((t) => t.id === openTicketId)

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">
            <span className="text-gold">Support</span> Client
          </h1>
          <p className="text-gray-500 mt-1">Creez un ticket et notre equipe vous repondra.</p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation ouverte */}
        {openTicket ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <button
              onClick={() => { setOpenTicketId(null); setReply('') }}
              className="text-sm text-gray-500 hover:text-white transition-colors self-start"
            >
              &larr; Retour aux tickets
            </button>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{openTicket.subject}</h2>
                  <p className="text-xs text-gray-500">
                    #{openTicket.id.slice(0, 8)} &middot; {openTicket.createdAt.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_LABELS[openTicket.status].color}`}>
                  {STATUS_LABELS[openTicket.status].label}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4">
                {openTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.sender === 'client'
                        ? 'bg-gold/20 text-white rounded-br-md'
                        : 'bg-white/10 text-gray-200 rounded-bl-md'
                    }`}>
                      <p className="text-xs text-gray-500 mb-1">
                        {msg.sender === 'admin' ? 'Support' : 'Vous'} &middot; {msg.createdAt.toLocaleString('fr-FR')}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Repondre */}
              {openTicket.status !== 'closed' ? (
                <div className="flex gap-2">
                  <textarea
                    className="input-field flex-1"
                    placeholder="Votre reponse..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                  />
                  <button
                    onClick={() => handleReply(openTicket.id)}
                    disabled={sending || !reply.trim()}
                    className="btn-primary px-6 self-end disabled:opacity-50"
                  >
                    {sending ? '...' : 'Envoyer'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">Ce ticket est ferme.</p>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Formulaire nouveau ticket */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Nouveau ticket</h2>
              <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Sujet *</label>
                  <input
                    className="input-field"
                    placeholder="Ex: Probleme avec ma commande..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Message *</label>
                  <textarea
                    className="input-field"
                    placeholder="Decrivez votre probleme en detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
                  {creating ? 'Creation...' : 'Creer le ticket'}
                </button>
              </form>
            </section>

            {/* Liste des tickets */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Mes tickets ({tickets.length})</h2>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Vous n&apos;avez aucun ticket.</p>
                  <p className="text-sm text-gray-600">Utilisez le formulaire ci-dessus pour contacter notre equipe.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tickets.map((ticket) => {
                    const lastMsg = ticket.messages[ticket.messages.length - 1]
                    const hasAdminReply = ticket.messages.some((m) => m.sender === 'admin')
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setOpenTicketId(ticket.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 text-left hover:bg-white/5 rounded-lg p-3 -m-3 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{ticket.subject}</p>
                            {hasAdminReply && lastMsg?.sender === 'admin' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold shrink-0">
                                Nouvelle reponse
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {lastMsg?.text || 'Aucun message'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''} &middot; {ticket.updatedAt.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${STATUS_LABELS[ticket.status].color}`}>
                          {STATUS_LABELS[ticket.status].label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
