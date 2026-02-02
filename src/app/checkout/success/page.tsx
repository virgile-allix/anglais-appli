import CheckoutSuccessClient from './CheckoutSuccessClient'
import { Suspense } from 'react'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  )
}
