'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { getUserOrders, type Order } from '@/lib/firestore'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, pick, localeTag } = useI18n()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const statusLabels: Record<Order['status'], { label: string; color: string }> = {
    pending: { label: t('En attente', 'Pending'), color: 'text-yellow-400 bg-yellow-400/10' },
    paid: { label: t('Payee', 'Paid'), color: 'text-green-400 bg-green-400/10' },
    shipped: { label: t('Expediee', 'Shipped'), color: 'text-blue-400 bg-blue-400/10' },
    delivered: { label: t('Livree', 'Delivered'), color: 'text-gray-400 bg-gray-400/10' },
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!user) return

    getUserOrders(user.uid)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-10"
        >
          {t('Mes', 'My')} <span className="text-gold">{t('Commandes', 'Orders')}</span>
        </motion.h1>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-6 text-gray-700">&#9671;</p>
            <h2 className="text-xl font-semibold mb-3">{t('Aucune commande', 'No orders')}</h2>
            <p className="text-gray-500 mb-8">{t("Vous n'avez pas encore passe de commande.", 'You have not placed any orders yet.')}</p>
            <Link href="/shop" className="btn-primary">{t('Voir la boutique', 'View the shop')}</Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order, idx) => {
              const statusInfo = statusLabels[order.status]
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card p-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-gray-600 font-mono">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {order.createdAt.toLocaleDateString(localeTag, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="border-t border-white/5 pt-4 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span className="text-gray-400">
                          {pick(item.nameI18n ?? item.name)} <span className="text-gray-600">x{item.quantity}</span>
                        </span>
                        <span>{(item.price * item.quantity).toFixed(2)} &euro;</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-sm text-gray-500">{t('Total', 'Total')}</span>
                    <span className="text-lg font-bold text-gold">{order.total.toFixed(2)} &euro;</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
