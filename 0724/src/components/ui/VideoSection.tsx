import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section
      id="video"
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
          Introduction
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
          Video
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: 16,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: 16,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <video
              ref={videoRef}
              src="/intro-video.mp4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 16,
              }}
              muted
              loop
              playsInline
              onClick={togglePlay}
            />
            
            {/* Play button overlay */}
            {!isPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '24px solid #fff',
                    borderTop: '14px solid transparent',
                    borderBottom: '14px solid transparent',
                    marginLeft: 8,
                  }}
                />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
