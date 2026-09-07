import { motion } from 'framer-motion'

const paragraphs = [
  {
    label: 'Intro',
    text: (
      <>
        안녕하세요! 가독성과 유지보수성을 갖춘 코드와 유려한 인터랙션을 사랑하는{' '}
        <span className="kw">예비 프론트엔드 개발자 류지민</span>입니다. 올해 26세인 저는{' '}
        <span className="kw">경성대학교 컴퓨터공학과</span> 4학년에 재학 중이며, 끊임없이 배우고 성장하는 것을 즐깁니다.
      </>
    ),
  },
  {
    label: 'Vision',
    text: (
      <>
        전공 지식을 바탕으로 탄탄한 소프트웨어 아키텍처를 고민하며, 사용자에게{' '}
        <span className="kw">시각적인 즐거움</span>을 주는 웹 경험을 만드는 데 관심이 많습니다. 현재는
        글로벌 역량을 키우기 위해 <span className="kw">'K-Move 프로그램'</span>에 열정적으로 참여하고
        있습니다. <span className="kw">글로벌 무대</span>에서 다양한 사람들과 협업하며 전 세계 사용자들과 소통하는 것이 저의 큰 목표입니다.
      </>
    ),
  },
  {
    label: 'Hobby',
    text: (
      <>
        평소에는 <span className="kw">게임</span>을 즐겨하며, 게임 속에서 발견하는 흥미로운{' '}
        <span className="kw">UI/UX</span>와 <span className="kw">화려한 이펙트</span>들을 웹 브라우저 상에 구현해보는 것을 좋아합니다.
      </>
    ),
  },
  {
    label: 'Attitude',
    text: (
      <>
        <span className="kw">맑은 물방울처럼</span>, 어떤 개발 환경이나 팀원들과도 유연하고 투명하게
        섞일 수 있는 소통 능력을 갖추고 있습니다. 복잡한 에러와 문제를{' '}
        <span className="kw">게임 퀘스트를 깨듯</span> 즐겁게 해결하며, 새로운 프레임워크와{' '}
        <span className="kw">여려 인터렉션 디자인</span>까지 탐구하며 저만의 개발 스펙트럼을 넓혀가고 있습니다.
      </>
    ),
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

// Profile image with glassmorphism frame
function ProfileImage() {
  return (
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        border: '2px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 40px rgba(47,181,245,0.4), inset 0 -4px 20px rgba(0,100,200,0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 12px 48px rgba(47,181,245,0.5), inset 0 -4px 20px rgba(0,100,200,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(47,181,245,0.4), inset 0 -4px 20px rgba(0,100,200,0.3)'
      }}
    >
      <img
        src="/profile.jpg"
        alt="류지민 프로필"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Glassmorphism overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 35% 32%, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        padding: 'clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px)',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="glass-card"
        style={{ padding: 'clamp(32px, 5vw, 64px)' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(160px, 28%, 280px) 1fr',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'start',
          }}
          className="about-grid"
        >
          {/* Left column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
              position: 'sticky',
              top: 80,
            }}
          >
            <ProfileImage />
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 900,
                margin: 0,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #b8eaff 50%, #2fb5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(47,181,245,0.5))',
                lineHeight: 1.1,
              }}
            >
              Who<br />am I?
            </h2>
            <div
              style={{
                width: 48,
                height: 2,
                background: 'linear-gradient(90deg, transparent, var(--emerald), transparent)',
                borderRadius: 2,
              }}
            />
          </div>

          {/* Right column — stagger paragraphs */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
          >
            {paragraphs.map((p) => (
              <motion.div key={p.label} variants={item}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--emerald)',
                    fontWeight: 700,
                    marginBottom: 8,
                    opacity: 0.8,
                  }}
                >
                  {p.label}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(14px, 1.6vw, 16px)',
                    lineHeight: 1.9,
                    color: 'rgba(255,255,255,0.88)',
                    wordBreak: 'keep-all',
                  }}
                >
                  {p.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Responsive: collapse to 1-col on mobile */}
      <style>{`
        @media (max-width: 680px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
          .about-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  )
}
