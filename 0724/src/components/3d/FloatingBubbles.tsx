import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  mouse: { x: number; y: number }
}

interface BubbleData {
  position: [number, number, number]
  radius: number
  speed: number
  phase: number
  amplitude: number
  segments: number
}

// 개별 버블 컴포넌트로 분리하여 개별 위치 애니메이션 처리
function BubbleItem({ data }: { data: BubbleData }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // 개별 위치 및 회전 애니메이션
    meshRef.current.position.y = data.position[1] + Math.sin(t * data.speed + data.phase) * data.amplitude
    meshRef.current.position.x = data.position[0] + Math.cos(t * data.speed * 0.5 + data.phase) * (data.amplitude * 0.4)
    meshRef.current.rotation.y = t * data.speed * 0.3
  })

  return (
    <Sphere ref={meshRef} args={[data.radius, data.segments, data.segments]} position={data.position}>
      <meshPhysicalMaterial
        transmission={1}
        roughness={0}
        metalness={0.05}
        ior={1.45}
        thickness={data.radius * 2.5}
        clearcoat={1}
        clearcoatRoughness={0}
        reflectivity={1}
        color="#c8eeff"
        transparent
        opacity={0.85}
      />
    </Sphere>
  )
}

export default function FloatingBubbles({ mouse }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const bubbles: BubbleData[] = useMemo(() => {
    const arr: BubbleData[] = []
    const rng = (min: number, max: number) => Math.random() * (max - min) + min
    for (let i = 0; i < 18; i++) {
      const radius = rng(0.12, 0.85)
      // 반지름이 작을수록 세그먼트를 낮춰 GPU 부하 감소 (기존 64x64 고정 → 16~48 범위)
      const segments = Math.max(16, Math.round(radius * 48))
      arr.push({
        position: [rng(-8, 8), rng(-5, 5), rng(-4, 1)],
        radius,
        speed: rng(0.3, 1.2),
        phase: rng(0, Math.PI * 2),
        amplitude: rng(0.15, 0.6),
        segments,
      })
    }
    return arr
  }, [])

  // Sparkle point positions
  const sparkleCount = 50
  const sparklePositions = useMemo(() => {
    const positions = new Float32Array(sparkleCount * 3)
    for (let i = 0; i < sparkleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return positions
  }, [])

  // 마우스 패럴랙스(시점 이동)만 전체 그룹 레벨에서 처리
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.3,
      0.05
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.y * 0.15,
      0.05
    )
  })

  return (
    <>
      <ambientLight intensity={0.6} color="#b8eaff" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-8, -5, -3]} intensity={0.4} color="#00c97a" />
      <pointLight position={[0, 5, 2]} intensity={0.8} color="#2fb5f5" />
      <Environment preset="city" />

      <group ref={groupRef}>
        {/* 버블 모음 */}
        {bubbles.map((b, i) => (
          <BubbleItem key={i} data={b} />
        ))}

        {/* Sparkle particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparklePositions, 3]}
              count={sparkleCount}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.06}
            color="#ffffff"
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      </group>
    </>
  )
}
