import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { Stamp } from '../lib/data'

interface Viewer3DProps {
  garment: { id: string; label: string }
  garmentColor: string
  selectedStamp: Stamp | null
  autoRotate: boolean
}

function drawStampPattern(stamp: Stamp, size: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  const { type, p, s } = stamp

  if (type === 'geo') {
    for (let i = 0; i < 5; i++) {
      const rd = r * (0.28 + i * 0.16)
      ctx.beginPath()
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3 - Math.PI / 6
        ctx.lineTo(cx + rd * Math.cos(a), cy + rd * Math.sin(a))
      }
      ctx.closePath()
      ctx.strokeStyle = i % 2 === 0 ? p : s
      ctx.lineWidth = size * 0.006
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.022, 0, Math.PI * 2)
    ctx.fillStyle = p
    ctx.fill()
  } else if (type === 'mono') {
    ctx.font = `300 ${size * 0.52}px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = p
    ctx.fillText('JM', cx, cy + size * 0.03)
  } else {
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = p
    ctx.fill()
  }
  ctx.restore()
  return canvas.toDataURL()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createGarmentGeometry(id: string): any {
  // Using BoxGeometry as placeholder - replace with GLB model
  if (id === 'tshirt') return new THREE.BoxGeometry(0.8, 1.0, 0.1)
  if (id === 'hoodie') return new THREE.BoxGeometry(0.9, 1.1, 0.12)
  if (id === 'cap') return new THREE.BoxGeometry(0.6, 0.3, 0.15)
  return new THREE.BoxGeometry(0.8, 0.9, 0.08)
}

function GarmentMesh({ garment, garmentColor, selectedStamp }: Viewer3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const stampPlaneRef = useRef<THREE.Mesh>(null)
  const [stampTexture, setStampTexture] = useState<string | null>(null)

  useEffect(() => {
    if (selectedStamp) {
      const dataUrl = drawStampPattern(selectedStamp, 512)
      setStampTexture(dataUrl)
    } else {
      setStampTexture(null)
    }
  }, [selectedStamp])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry = createGarmentGeometry(garment.id)
    }
  }, [garment.id])

  const getStampScale = () => {
    if (garment.id === 'cap') return 0.36
    if (garment.id === 'tote') return 0.52
    return 0.44
  }

  const getStampY = () => {
    if (garment.id === 'tote') return 0
    return 0.12
  }

  return (
    <group>
      <mesh ref={meshRef}>
        <primitive object={createGarmentGeometry(garment.id)} />
        <meshStandardMaterial color={garmentColor} roughness={0.88} metalness={0.03} />
      </mesh>
      {stampTexture && (
        <mesh ref={stampPlaneRef} position={[0, getStampY(), 0.055]}>
          <planeGeometry args={[getStampScale(), getStampScale()]} />
          <meshBasicMaterial map={new THREE.TextureLoader().load(stampTexture)} transparent />
        </mesh>
      )}
    </group>
  )
}

export function Viewer3D({ garment, garmentColor, selectedStamp, autoRotate }: Viewer3DProps) {
  return (
    <div className="w-full h-full cursor-grab">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: '#0a0908' }}>
        <ambientLight intensity={0.55} color="#fff5e8" />
        <directionalLight position={[2, 4, 3]} intensity={1.3} color="#fff0d8" />
        <directionalLight position={[-3, 0, 2]} intensity={0.35} color="#c8d8ff" />
        <directionalLight position={[0, -2, -2]} intensity={0.25} color="#ffd080" />
        <GarmentMesh garment={garment} garmentColor={garmentColor} selectedStamp={selectedStamp} autoRotate={autoRotate} />
        <OrbitControls enablePan={false} enableZoom={true} minDistance={1.8} maxDistance={5.5} minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.2} autoRotate={autoRotate} autoRotateSpeed={0.5} />
        <Environment preset="city" background={false} />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  )
}