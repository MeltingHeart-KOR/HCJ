import { motion } from 'framer-motion'

const skills = [
  { name: 'React', icon: '⚛', color: '#61dafb' },
  { name: 'TypeScript', icon: 'TS', color: '#3178c6' },
  { name: 'Three.js', icon: '▲', color: '#ffffff' },
  { name: 'Next.js', icon: 'N', color: '#ffffff' },
  { name: 'C#', icon: '◈', color: '#ff4d8b' },
  { name: 'Unity', icon: '⚡', color: '#88ce02' },
  { name: 'CSS / Tailwind', icon: '✦', color: '#38bdf8' },
  { name: 'Git', icon: '⑂', color: '#f05032' },
]

function GlossyIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: `radial-gradient(circle at 38% 30%, rgba(255,255,255,0.65) 0%, ${color}55 40%, ${color}22 100%)`,
        border: `1px solid ${color}66`,
        boxShadow: `0 4px 20px ${color}40, inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -2px 8px ${color}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: icon.length > 1 ? 16 : 26,
        fontWeight: 800,
        color: '#fff',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Specular highlight like MSN/iTunes icon style */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '18%',
          width: '46%',
          height: '30%',
          background: 'rgba(255,255,255,0.55)',
          borderRadius: '50%',
          filter: 'blur(3px)',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{icon}</span>
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function SkillsSection() {
  return (
    <section
      id="skills"
      style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 80px)',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--emerald)', fontWeight: 700, marginBottom: 12 }}>
          Tech Stack
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(180deg, #ffffff 0%, #b8eaff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Skills
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {skills.map((skill) => (
          <motion.div
            key={skill.name}
            variants={cardVariant}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass-card"
            style={{
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'default',
            }}
          >
            <GlossyIcon icon={skill.icon} color={skill.color} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.2,
              }}
            >
              {skill.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
