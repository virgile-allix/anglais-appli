'use client'

import { useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Import 3D dynamique (pas de SSR)
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function Home() {
  const scrollProgress = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollProgress.current = self.progress
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* ─── Canvas 3D fixé en arrière-plan ─── */}
      <div className="fixed inset-0 z-0">
        <Scene scrollProgress={scrollProgress} />
      </div>

      {/* ─── Gradient overlay pour la lisibilité ─── */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-dark/30 via-transparent to-dark/80" />

      {/* ─── Contenu scrollable par-dessus la scène 3D ─── */}
      <div className="relative z-10">
        {/* ── Section Hero ── */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm uppercase tracking-[0.3em] text-gold mb-4"
            >
              Collection exclusive
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6"
            >
              L&apos;excellence
              <br />
              <span className="gradient-text">redéfinie</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto"
            >
              Découvrez des produits pensés pour ceux qui ne font aucun
              compromis sur la qualité.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
              <Link href="/shop" className="btn-primary">
                Explorer la boutique
              </Link>
              <a href="#features" className="btn-outline">
                En savoir plus
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Section Features ── */}
        <section id="features" className="min-h-screen flex items-center px-6 py-32">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="text-center mb-20"
            >
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Pourquoi <span className="text-gold">nous choisir</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 max-w-lg mx-auto">
                Une expérience d&apos;achat pensée dans les moindres détails.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: '◆',
                  title: 'Qualité Premium',
                  desc: 'Chaque produit est sélectionné pour répondre aux standards les plus élevés.',
                },
                {
                  icon: '⚡',
                  title: 'Livraison Express',
                  desc: 'Recevez votre commande rapidement, où que vous soyez.',
                },
                {
                  icon: '🎨',
                  title: 'Création 3D',
                  desc: 'Créez votre propre figurine personnalisée grâce à notre IA générative.',
                  highlight: true,
                  link: '/create-figurine',
                },
              ].map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`card p-8 text-center ${'highlight' in feature && feature.highlight ? 'border-gold/30 bg-gold/5' : ''}`}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{feature.desc}</p>
                  {'link' in feature && feature.link && (
                    <Link href={feature.link} className="text-sm text-gold hover:text-gold-light transition-colors">
                      Essayer maintenant &rarr;
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Section CTA finale ── */}
        <section className="min-h-[60vh] flex items-center justify-center px-6 py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-2xl"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Prêt à découvrir
              <br />
              <span className="text-gold">la différence</span> ?
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link href="/shop" className="btn-primary text-lg">
                Voir la collection
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
