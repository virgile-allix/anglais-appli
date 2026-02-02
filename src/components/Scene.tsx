'use client'

import { useRef, useMemo, MutableRefObject, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Float,
  MeshDistortMaterial,
  Stars,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ─── Sphère centrale dorée avec distorsion ─── */
function GoldSphere({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!ref.current) return
    const t = scrollProgress.current
    ref.current.rotation.y = state.clock.elapsedTime * 0.15 + t * Math.PI * 2
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
    const s = 1 + t * 0.3
    ref.current.scale.setScalar(s)
  })

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color="#d4a853"
          roughness={0.15}
          metalness={0.95}
          distort={0.3}
          speed={1.5}
        />
      </mesh>
    </Float>
  )
}

/* ─── Forme orbitale ─── */
function OrbitShape({
  position,
  color,
  speed,
  size,
  geometryType,
  scrollProgress,
}: {
  position: [number, number, number]
  color: string
  speed: number
  size: number
  geometryType: 'torus' | 'octahedron' | 'dodecahedron'
  scrollProgress: MutableRefObject<number>
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!ref.current) return
    const elapsed = state.clock.elapsedTime
    const t = scrollProgress.current

    ref.current.rotation.x = elapsed * speed * 0.3
    ref.current.rotation.z = elapsed * speed * 0.2

    const spread = 1 + t * 0.8
    ref.current.position.x = position[0] * spread
    ref.current.position.y = position[1] * spread + Math.sin(elapsed * speed) * 0.3
    ref.current.position.z = position[2] * spread
  })

  const geometry = useMemo(() => {
    switch (geometryType) {
      case 'torus':
        return <torusGeometry args={[size, size * 0.35, 12, 24]} />
      case 'octahedron':
        return <octahedronGeometry args={[size]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size]} />
    }
  }, [geometryType, size])

  return (
    <Float speed={speed} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.85}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  )
}

/* ─── Particules flottantes ─── */
function Particles() {
  const count = 200
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d4a853"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

/* ─── Camera Rig piloté par le scroll ─── */
function CameraRig({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  useFrame((state) => {
    const t = scrollProgress.current
    const angle = t * Math.PI * 0.5
    const radius = 5 - t * 1.5
    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.y = t * 1.5
    state.camera.position.z = Math.cos(angle) * radius
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── Gestion de la perte de contexte WebGL ─── */
function ContextHandler() {
  const { gl } = useThree()

  useMemo(() => {
    const canvas = gl.domElement
    const handleLost = (e: Event) => {
      e.preventDefault()
      console.warn('WebGL context lost - will restore')
    }
    const handleRestored = () => {
      console.log('WebGL context restored')
    }
    canvas.addEventListener('webglcontextlost', handleLost)
    canvas.addEventListener('webglcontextrestored', handleRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [gl])

  return null
}

/* ─── Composant principal ─── */
export default function Scene({
  scrollProgress,
}: {
  scrollProgress: MutableRefObject<number>
}) {
  const onCreated = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    // Limiter le pixel ratio pour économiser le GPU
    state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 70 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
      onCreated={onCreated}
      frameloop="always"
    >
      <ContextHandler />
      <CameraRig scrollProgress={scrollProgress} />

      {/* Lumières */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-4, 3, -3]} color="#d4a853" intensity={1.5} distance={15} />

      {/* Sphère dorée principale */}
      <GoldSphere scrollProgress={scrollProgress} />

      {/* Formes orbitales (réduit à 3) */}
      <OrbitShape position={[3.2, 1.2, -2]} color="#c0392b" speed={1.6} size={0.45} geometryType="torus" scrollProgress={scrollProgress} />
      <OrbitShape position={[-3, -1.5, -1]} color="#2980b9" speed={1.3} size={0.55} geometryType="octahedron" scrollProgress={scrollProgress} />
      <OrbitShape position={[2.2, -2.2, 1.5]} color="#8e44ad" speed={1.8} size={0.4} geometryType="dodecahedron" scrollProgress={scrollProgress} />

      {/* Particules et étoiles (réduit) */}
      <Particles />
      <Stars radius={50} depth={50} count={500} factor={3} saturation={0} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  )
}
