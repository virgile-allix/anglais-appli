'use client'

import { useRef, useMemo, MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  MeshDistortMaterial,
  Stars,
  Environment,
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ─── Sphère centrale dorée avec distorsion ─── */
function GoldSphere({ scrollProgress }: { scrollProgress: MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = scrollProgress.current
    ref.current.rotation.y = state.clock.elapsedTime * 0.15 + t * Math.PI * 2
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
    // Léger scale basé sur le scroll
    const s = 1 + t * 0.3
    ref.current.scale.setScalar(s)
  })

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.5, 12]} />
        <MeshDistortMaterial
          color="#d4a853"
          roughness={0.15}
          metalness={0.95}
          distort={0.35}
          speed={1.8}
        />
      </mesh>
    </Float>
  )
}

/* ─── Forme orbitale générique ─── */
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
    const elapsed = state.clock.elapsedTime
    const t = scrollProgress.current

    ref.current.rotation.x = elapsed * speed * 0.3
    ref.current.rotation.z = elapsed * speed * 0.2

    // Les shapes s'écartent quand on scroll
    const spread = 1 + t * 0.8
    ref.current.position.x = position[0] * spread
    ref.current.position.y = position[1] * spread + Math.sin(elapsed * speed) * 0.3
    ref.current.position.z = position[2] * spread
  })

  const geometry = useMemo(() => {
    switch (geometryType) {
      case 'torus':
        return <torusGeometry args={[size, size * 0.35, 16, 32]} />
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
  const count = 400
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
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
    ref.current.rotation.x = state.clock.elapsedTime * 0.008
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

    // Mouvement orbital doux de la caméra
    const angle = t * Math.PI * 0.5
    const radius = 5 - t * 1.5
    state.camera.position.x = Math.sin(angle) * radius
    state.camera.position.y = t * 1.5
    state.camera.position.z = Math.cos(angle) * radius

    state.camera.lookAt(0, 0, 0)
  })

  return null
}

/* ─── Composant principal exporté ─── */
export default function Scene({
  scrollProgress,
}: {
  scrollProgress: MutableRefObject<number>
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 70 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <CameraRig scrollProgress={scrollProgress} />

      {/* Lumières */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-4, 3, -3]} color="#d4a853" intensity={2} distance={15} />
      <pointLight position={[4, -3, 2]} color="#2980b9" intensity={1} distance={12} />

      {/* Sphère dorée principale */}
      <GoldSphere scrollProgress={scrollProgress} />

      {/* Formes orbitales */}
      <OrbitShape
        position={[3.2, 1.2, -2]}
        color="#c0392b"
        speed={1.6}
        size={0.45}
        geometryType="torus"
        scrollProgress={scrollProgress}
      />
      <OrbitShape
        position={[-3, -1.5, -1]}
        color="#2980b9"
        speed={1.3}
        size={0.55}
        geometryType="octahedron"
        scrollProgress={scrollProgress}
      />
      <OrbitShape
        position={[2.2, -2.2, 1.5]}
        color="#8e44ad"
        speed={1.8}
        size={0.4}
        geometryType="dodecahedron"
        scrollProgress={scrollProgress}
      />
      <OrbitShape
        position={[-2, 2.5, 0.5]}
        color="#d4a853"
        speed={1.1}
        size={0.35}
        geometryType="torus"
        scrollProgress={scrollProgress}
      />

      {/* Particules et étoiles */}
      <Particles />
      <Stars radius={60} depth={60} count={800} factor={3} saturation={0} />

      {/* Environnement */}
      <Environment preset="night" />

      {/* Post-processing : bloom */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.2}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
