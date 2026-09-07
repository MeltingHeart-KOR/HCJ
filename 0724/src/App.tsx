import { Suspense } from 'react'
import Scene3D from './components/3d/Scene3D'
import HeroSection from './components/ui/HeroSection'
import AboutSection from './components/ui/AboutSection'
import VideoSection from './components/ui/VideoSection'
import SkillsSection from './components/ui/SkillsSection'
import ProjectsSection from './components/ui/ProjectCard'

function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.12)',
        marginTop: 40,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
        © 2025 류지민 · Jimin Ryu · Built with Three.js & React
      </p>
    </footer>
  )
}

export default function App() {
  return (
    <>
      {/* Fixed 3D background */}
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>

      {/* 2D scrollable content on top */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <HeroSection />
        <AboutSection />
        <VideoSection />
        <SkillsSection />
        <ProjectsSection />
        <Footer />
      </div>
    </>
  )
}
