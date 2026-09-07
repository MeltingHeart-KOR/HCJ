import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import FloatingBubbles from './FloatingBubbles'

export default function Scene3D() {
  // mouse를 React state가 아닌 ref로 관리 -> 매 프레임 리렌더 방지
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }

    const animate = () => {
      // 객체를 새로 만들지 않고 값만 in-place로 갱신
      // (Scene3D가 리렌더되지 않으므로 FloatingBubbles에 전달된 참조가 계속 같은 객체를 가리켜야 함)
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.06
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.06
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          // WebGL context 손실/복구 핸들링
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('[Scene3D] WebGL context lost — 복구를 시도합니다.')
          })
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('[Scene3D] WebGL context restored.')
          })
        }}
      >
        <FloatingBubbles mouse={mouseRef.current} />
      </Canvas>
    </div>
  )
}
