'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '@/context/LanguageContext'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

// Golden particles data
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  delay: Math.random() * 10,
  duration: 8 + Math.random() * 12,
  size: 2 + Math.random() * 3,
  opacity: 0.15 + Math.random() * 0.35,
}))

export default function Home() {
  const { t, locale } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Hero mask text: scale up to reveal video
      gsap.to('.hero-mask-text', {
        scale: 20,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: '.hero-spacer',
          start: 'top top',
          end: '55% top',
          scrub: 0.8,
        },
      })

      // Mask overlay: fade out after text fills screen
      gsap.to('.hero-mask-overlay', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-spacer',
          start: '45% top',
          end: '65% top',
          scrub: true,
        },
      })

      // Hero logo: fade out early
      gsap.to('.hero-logo', {
        opacity: 0,
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-spacer',
          start: 'top top',
          end: '15% top',
          scrub: true,
        },
      })

      // Hero subtitle: fade out early
      gsap.to('.hero-subtitle', {
        opacity: 0,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-spacer',
          start: 'top top',
          end: '12% top',
          scrub: true,
        },
      })

      // Scroll indicator: fade out
      gsap.to('.home-scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
          trigger: '.hero-spacer',
          start: '3% top',
          end: '8% top',
          scrub: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const features =
    locale === 'fr'
      ? [
          {
            icon: '\u2726',
            title: 'Qualite Premium',
            desc: 'Chaque figurine est selectionnee pour repondre aux standards les plus eleves de detail et de finition.',
          },
          {
            icon: '\u26A1',
            title: 'Livraison Express',
            desc: 'Recevez votre commande rapidement, ou que vous soyez en France.',
          },
          {
            icon: '\uD83C\uDFA8',
            title: 'Creation 3D',
            desc: 'Creez votre propre figurine personnalisee grace a notre IA generative.',
            highlight: true,
            link: '/create-figurine',
          },
        ]
      : [
          {
            icon: '\u2726',
            title: 'Premium Quality',
            desc: 'Each figurine is selected to meet the highest standards of detail and finish.',
          },
          {
            icon: '\u26A1',
            title: 'Fast Shipping',
            desc: 'Receive your order quickly, wherever you are.',
          },
          {
            icon: '\uD83C\uDFA8',
            title: '3D Creation',
            desc: 'Create your own personalized figurine with our generative AI.',
            highlight: true,
            link: '/create-figurine',
          },
        ]

  return (
    <div ref={containerRef}>
      {/* ===== FIXED VIDEO BACKGROUND ===== */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/videos/home-bg.mp4`} type="video/mp4" />
      </video>

      {/* Fixed subtle gradient */}
      <div
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-dark/10 via-transparent to-dark/40"
        style={{ zIndex: 1 }}
      />

      {/* ===== TEXT MASK OVERLAY (video visible through text) ===== */}
      <div
        className="hero-mask-overlay fixed inset-0 bg-black flex items-center justify-center"
        style={{ zIndex: 2, mixBlendMode: 'multiply' }}
      >
        <div className="hero-mask-text will-change-transform select-none">
          <h1 className="text-white text-[13vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter text-center">
            {locale === 'fr' ? (
              <>
                L&apos;EXCELLENCE
                <br />
                <span className="text-[15vw] md:text-[12vw]">REDEFINIE</span>
              </>
            ) : (
              <>
                EXCELLENCE
                <br />
                <span className="text-[15vw] md:text-[12vw]">REDEFINED</span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Hero logo (above text, centered) */}
      <div
        className="hero-logo fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 3, paddingBottom: '35vh' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <Image
            src={`${basePath}/logo_sans_fond.png`}
            alt="Premium Store"
            width={400}
            height={120}
            className="h-28 sm:h-36 md:h-44 w-auto"
            priority
          />
        </motion.div>
      </div>

      {/* Hero subtitle (above mask, fades early) */}
      <div
        className="hero-subtitle fixed inset-0 flex items-end justify-center pb-36 pointer-events-none"
        style={{ zIndex: 3 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-gold text-xs sm:text-sm uppercase tracking-[0.3em]"
        >
          {t('Figurines premium', 'Premium figurines')}
        </motion.p>
      </div>

      {/* ===== GOLDEN PARTICLES ===== */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 4 }}
      >
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gold particle-float"
            style={
              {
                left: p.left,
                bottom: '-10px',
                width: p.size,
                height: p.size,
                '--p-o': p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="home-scroll-indicator fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 5 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-[10px] text-gray-500 uppercase tracking-[0.25em]"
        >
          Scroll
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="w-5 h-8 rounded-full border border-gold/30 flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1 h-1 rounded-full bg-gold"
          />
        </motion.div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Hero spacer (scroll room for the mask animation) */}
        <div className="hero-spacer" style={{ height: '250vh' }} />

        {/* Section Features */}
        <section
          id="features"
          className="relative min-h-screen px-6 py-32"
        >
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-[2px]" />
          <div className="relative z-10 max-w-6xl mx-auto w-full">
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
                {t('Pourquoi', 'Why')}{' '}
                <span className="text-gold">
                  {t('nous choisir', 'choose us')}
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-gray-400 max-w-lg mx-auto"
              >
                {t(
                  "Des figurines d'exception pour les collectionneurs exigeants.",
                  'Exceptional figurines for discerning collectors.'
                )}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`card p-8 text-center ${
                    'highlight' in feature && feature.highlight
                      ? 'border-gold/30 bg-gold/5'
                      : ''
                  }`}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{feature.desc}</p>
                  {'link' in feature && feature.link && (
                    <Link
                      href={feature.link}
                      className="text-sm text-gold hover:text-gold-light transition-colors"
                    >
                      {t('Essayer maintenant', 'Try it now')} &rarr;
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Section CTA finale */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-32">
          <div className="absolute inset-0 bg-dark/50" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative z-10 text-center max-w-2xl"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              {t('Pret a decouvrir', 'Ready to discover')}
              <br />
              <span className="text-gold">
                {t('la difference', 'the difference')}
              </span>{' '}
              ?
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link href="/shop" className="btn-primary text-lg">
                {t('Voir la collection', 'View the collection')}
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
