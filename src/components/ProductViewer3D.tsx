'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)

  // Centrer et redimensionner le modele
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 2 / maxDim

  const center = box.getCenter(new THREE.Vector3())
  scene.position.sub(center)

  return (
    <group scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  )
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Chargement 3D...</p>
      </div>
    </Html>
  )
}

function Placeholder() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5
      ref.current.rotation.x += delta * 0.2
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#c9a227" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

type Props = {
  modelUrl?: string
  className?: string
}

export default function ProductViewer3D({ modelUrl, className = '' }: Props) {
  return (
    <div className={`relative bg-dark-tertiary rounded-2xl overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<LoadingSpinner />}>
          {modelUrl ? (
            <Model url={`${process.env.NEXT_PUBLIC_API_URL || 'https://anglais-api1.vercel.app'}/meshy/proxy?url=${encodeURIComponent(modelUrl)}`} />
          ) : (
            <Placeholder />
          )}
          <Environment preset="city" />
        </Suspense>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={1}
        />
      </Canvas>

      {/* Controles hint */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none">
        <p className="text-[10px] text-gray-500">
          Cliquez et faites glisser pour faire pivoter
        </p>
        <p className="text-[10px] text-gray-500">
          Scrollez pour zoomer
        </p>
      </div>

      {/* Badge 3D */}
      {modelUrl && (
        <div className="absolute top-3 right-3 bg-gold/20 text-gold text-xs font-semibold px-2 py-1 rounded-lg">
          3D
        </div>
      )}
    </div>
  )
}
