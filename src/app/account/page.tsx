'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/LanguageContext'
import { getUserAddresses, saveUserAddresses, type Address } from '@/lib/firestore'

const COOKIE_KEY = 'ps-cookie-consent'

const EMPTY_ADDRESS: Address = {
  label: '',
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  zip: '',
  country: 'France',
  phone: '',
}

export default function AccountPage() {
  const { user, profile, loading, logout } = useAuth()
  const { t, localeTag } = useI18n()
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressMsg, setAddressMsg] = useState('')

  const [cookieConsent, setCookieConsent] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUserAddresses(user.uid).then(setAddresses).catch(() => {})
    try {
      setCookieConsent(localStorage.getItem(COOKIE_KEY))
    } catch {}
  }, [user])

  const handleSaveAddress = async () => {
    if (!user || !editingAddress) return
    if (!editingAddress.firstName.trim() || !editingAddress.lastName.trim() || !editingAddress.street.trim() || !editingAddress.city.trim() || !editingAddress.zip.trim()) {
      setAddressMsg(t('Veuillez remplir tous les champs obligatoires.', 'Please fill in all required fields.'))
      return
    }
    setSavingAddress(true)
    setAddressMsg('')
    try {
      const updated = [...addresses]
      if (editingIndex !== null) {
        updated[editingIndex] = editingAddress
      } else {
        updated.push(editingAddress)
      }
      await saveUserAddresses(user.uid, updated)
      setAddresses(updated)
      setEditingAddress(null)
      setEditingIndex(null)
      setAddressMsg(t('Adresse sauvegardee.', 'Address saved.'))
    } catch {
      setAddressMsg(t('Erreur lors de la sauvegarde.', 'Error while saving.'))
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (index: number) => {
    if (!user) return
    const updated = addresses.filter((_, i) => i !== index)
    try {
      await saveUserAddresses(user.uid, updated)
      setAddresses(updated)
      setAddressMsg(t('Adresse supprimee.', 'Address deleted.'))
    } catch {
      setAddressMsg(t('Erreur lors de la suppression.', 'Error while deleting.'))
    }
  }

  const handleCookieChange = (value: string) => {
    try { localStorage.setItem(COOKIE_KEY, value) } catch {}
    setCookieConsent(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-9 bg-white/5 rounded w-48 mb-10" />
          <div className="card p-6 mb-6 space-y-4">
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-10 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-10 bg-white/5 rounded w-full" />
          </div>
          <div className="card p-6 space-y-4">
            <div className="h-4 bg-white/5 rounded w-40" />
            <div className="h-10 bg-white/5 rounded w-full" />
            <div className="h-10 bg-white/5 rounded w-full" />
            <div className="h-10 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const addressMsgIsError = addressMsg.toLowerCase().includes('erreur') || addressMsg.toLowerCase().includes('error')

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-10">
            <h1 className="text-3xl font-bold">
              {t('Mon', 'My')} <span className="text-gold">{t('Compte', 'Account')}</span>
            </h1>
            {profile?.isAdmin && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-gold">
                ADMIN
              </span>
            )}
          </div>

          {/* Informations */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('Informations', 'Information')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Email</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">UID</span>
                <span className="text-xs text-gray-600 font-mono">{user.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t('Role', 'Role')}</span>
                <span className="text-sm">{profile?.isAdmin ? t('Administrateur', 'Administrator') : t('Client', 'Customer')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t('Inscrit le', 'Joined on')}</span>
                <span className="text-sm">
                  {profile?.createdAt
                    ? profile.createdAt.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Adresses */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                {t('Mes adresses', 'My addresses')}
              </h2>
              {!editingAddress && (
                <button
                  onClick={() => { setEditingAddress({ ...EMPTY_ADDRESS }); setEditingIndex(null); setAddressMsg('') }}
                  className="text-xs text-gold hover:text-gold-light transition-colors"
                >
                  {t('+ Ajouter', '+ Add')}
                </button>
              )}
            </div>

            {addressMsg && (
              <p className={`text-xs mb-3 ${addressMsgIsError ? 'text-red-400' : 'text-green-400'}`}>
                {addressMsg}
              </p>
            )}

            {editingAddress ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Label', 'Label')}</label>
                    <input className="input-field" placeholder={t('Ex: Domicile', 'e.g. Home')} value={editingAddress.label}
                      onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Telephone', 'Phone')}</label>
                    <input className="input-field" placeholder={t('06 12 34 56 78', '+33 6 12 34 56 78')} value={editingAddress.phone}
                      onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Prenom *', 'First name *')}</label>
                    <input className="input-field" value={editingAddress.firstName}
                      onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Nom *', 'Last name *')}</label>
                    <input className="input-field" value={editingAddress.lastName}
                      onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t('Adresse *', 'Address *')}</label>
                  <input className="input-field" placeholder={t('123 Rue Example', '123 Example St')} value={editingAddress.street}
                    onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Code postal *', 'ZIP code *')}</label>
                    <input className="input-field" placeholder="75001" value={editingAddress.zip}
                      onChange={(e) => setEditingAddress({ ...editingAddress, zip: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Ville *', 'City *')}</label>
                    <input className="input-field" placeholder={t('Paris', 'Paris')} value={editingAddress.city}
                      onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">{t('Pays', 'Country')}</label>
                    <input className="input-field" value={editingAddress.country}
                      onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={handleSaveAddress} disabled={savingAddress} className="btn-primary text-sm disabled:opacity-50">
                    {savingAddress ? t('Sauvegarde...', 'Saving...') : t('Sauvegarder', 'Save')}
                  </button>
                  <button onClick={() => { setEditingAddress(null); setEditingIndex(null) }} className="btn-outline text-sm">
                    {t('Annuler', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-gray-500">{t('Aucune adresse enregistree.', 'No saved addresses.')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-dark-tertiary">
                    <div>
                      {addr.label && <p className="text-xs text-gold font-semibold mb-1">{addr.label}</p>}
                      <p className="text-sm">{addr.firstName} {addr.lastName}</p>
                      <p className="text-xs text-gray-400">{addr.street}</p>
                      <p className="text-xs text-gray-400">{addr.zip} {addr.city}, {addr.country}</p>
                      {addr.phone && <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => { setEditingAddress({ ...addr }); setEditingIndex(i); setAddressMsg('') }}
                        className="text-xs text-gray-500 hover:text-gold transition-colors"
                      >
                        {t('Modifier', 'Edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(i)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        {t('Supprimer', 'Delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferences cookies */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('Preferences cookies', 'Cookie preferences')}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {t(
                "Ce site utilise uniquement des cookies fonctionnels (authentification, panier). Aucun cookie publicitaire n'est utilise.",
                'This site only uses functional cookies (authentication, cart). No advertising cookies are used.'
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCookieChange('accepted')}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                  cookieConsent === 'accepted'
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                {t('Cookies acceptes', 'Cookies accepted')}
              </button>
              <button
                onClick={() => handleCookieChange('refused')}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                  cookieConsent === 'refused'
                    ? 'border-red-500/50 bg-red-500/10 text-red-400'
                    : 'border-white/10 text-gray-500 hover:text-white'
                }`}
              >
                {t('Cookies refuses', 'Cookies declined')}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              <Link href="/confidentialite" className="text-gold hover:text-gold-light transition-colors">
                {t('Voir la politique de confidentialite', 'View privacy policy')}
              </Link>
            </p>
          </div>

          {/* Raccourcis */}
          <div className="card p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              {t('Raccourcis', 'Shortcuts')}
            </h2>
            <div className="flex flex-col gap-3">
              <Link href="/orders" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <span className="text-sm">{t('Mes commandes', 'My orders')}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/my-figurines" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t('Mes figurines', 'My figurines')}</span>
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">3D</span>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/support" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <span className="text-sm">{t('Support', 'Support')}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/shop" className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-white/5 transition-colors">
                <span className="text-sm">{t('Voir la boutique', 'View the shop')}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <button onClick={logout} className="btn-outline text-sm">
            {t('Se deconnecter', 'Log out')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
