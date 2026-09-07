import { useRef, type MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface Project {
  title: string
  desc: string
  tags: string[]
  accent: string
}

const projects: Project[] = [
  {
    title: '3D Frutiger Aero Portfolio',
    desc: 'Three.js + R3F로 구현한 유리 질감 인터랙티브 포트폴리오. 마우스 패럴랙스와 glassmorphism 디자인 시스템 적용.',
    tags: ['Three.js', 'R3F', 'Framer Motion'],
    accent: '#2fb5f5',
  },
  {
    title: 'Dice-Hacking 실시간 전략 주사위 게임',
    desc: '실시간 전략 주사위 게임 개발 팀장으로서 게임 아키텍처 설계 및 게임 시스템 구현.',
    tags: ['Unity6', 'Photon', 'C#'],
    accent: '#00c97a',
  },
  {
    title: '3D 지뢰 찾기 게임',
    desc: '3D 공간에서의 지뢰 찾기 게임 개발. 다양한 난이도 제공.',
    tags: ['Next.js', 'Three.js'],
    accent: '#ff4d8b',
  },
]

function TiltCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    cardRef.current.style.transform = `perspective(1000px) rotateY(${dx * 12}deg) rotateX(${-dy * 8}deg) scale(1.03)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
      }}
    >
      <div
        className="glass-card"
        style={{ padding: 32, height: '100%' }}
      >
        {/* Glossy top accent bar */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)`,
            borderRadius: 2,
            marginBottom: 24,
            boxShadow: `0 0 12px ${project.accent}80`,
          }}
        />

        <h3
          style={{
            margin: '0 0 12px',
            fontSize: 20,
            fontWeight: 800,
            // 프루티거 에어로 테마에 맞추어 가독성과 시인성을 높인 진청색 계열로 변경
            color: '#0f172a',
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </h3>

        <p
          style={{
            margin: '0 0 20px',
            fontSize: 14,
            lineHeight: 1.8,
            // 요구사항 반영: 글자 색상을 더 선명하게 변경하여 가독성 극대화 (기존 0.72 투명도에서 선명한 딥 그레이/블루 톤으로 조정)
            color: '#334155',
            fontWeight: 500,
          }}
        >
          {project.desc}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '4px 12px',
                borderRadius: 50,
                background: `${project.accent}22`,
                border: `1px solid ${project.accent}55`,
                fontSize: 12,
                fontWeight: 600,
                color: project.accent,
                letterSpacing: '0.05em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function ProjectsSection() {
  return (
    <section
      id="projects"
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
          Works
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
          Projects
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        {projects.map((project) => (
          <motion.div key={project.title} variants={cardAnim}>
            <TiltCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}