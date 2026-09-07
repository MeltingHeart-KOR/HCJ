import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Decorative top sparkle line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        style={{
          width: 120,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #fff, transparent)',
          marginBottom: 32,
          borderRadius: 2,
        }}
      />

      {/* English subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{
          fontSize: 13,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        Frontend Developer · Portfolio
      </motion.p>

      {/* Korean name */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 'clamp(56px, 10vw, 120px)',
          fontWeight: 900,
          lineHeight: 1,
          margin: '0 0 12px',
          background: 'linear-gradient(180deg, #ffffff 0%, #b8eaff 60%, #2fb5f5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(47,181,245,0.6))',
        }}
      >
        류지민
      </motion.h1>

      {/* English name */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        style={{
          fontSize: 'clamp(20px, 3vw, 36px)',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.85)',
          letterSpacing: '0.12em',
          margin: '0 0 32px',
        }}
      >
        Jimin Ryu
      </motion.h2>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.85 }}
        style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.65)',
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        맑은 코드와 유려한 인터랙션으로<br />
        빛나는 웹 경험을 만드는 개발자
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1 }}
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button
          className="glossy-btn"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          About Me
        </button>
        <button
          className="glossy-btn"
          style={{
            background: 'linear-gradient(180deg, rgba(0,201,122,0.4) 0%, rgba(0,100,60,0.3) 100%)',
            borderColor: 'rgba(0,201,122,0.6)',
          }}
          onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Projects
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{
            width: 1.5,
            height: 36,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)',
            borderRadius: 2,
          }}
        />
      </motion.div>
    </section>
  )
}
