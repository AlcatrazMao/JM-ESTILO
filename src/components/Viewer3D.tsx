import { useEffect, useMemo } from 'react'
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

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.07,
  bevelEnabled: true,
  bevelThickness: 0.014,
  bevelSize: 0.01,
  bevelSegments: 2,
}

function makeTshirt(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.38, -0.5)
  s.lineTo(0.38, -0.5)
  s.lineTo(0.38, 0.07)
  s.lineTo(0.66, -0.02)
  s.lineTo(0.66, 0.28)
  s.lineTo(0.38, 0.37)
  s.lineTo(0.14, 0.5)
  s.quadraticCurveTo(0, 0.38, -0.14, 0.5)
  s.lineTo(-0.38, 0.37)
  s.lineTo(-0.66, 0.28)
  s.lineTo(-0.66, -0.02)
  s.lineTo(-0.38, 0.07)
  s.closePath()
  return s
}

function makeHoodie(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.44, -0.5)
  s.lineTo(0.44, -0.5)
  s.lineTo(0.44, 0.06)
  s.lineTo(0.74, -0.04)
  s.lineTo(0.74, 0.25)
  s.lineTo(0.44, 0.36)
  s.lineTo(0.16, 0.5)
  s.quadraticCurveTo(0, 0.42, -0.16, 0.5)
  s.lineTo(-0.44, 0.36)
  s.lineTo(-0.74, 0.25)
  s.lineTo(-0.74, -0.04)
  s.lineTo(-0.44, 0.06)
  s.closePath()
  return s
}

function makeCrewneck(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.41, -0.5)
  s.lineTo(0.41, -0.5)
  s.lineTo(0.41, 0.06)
  s.lineTo(0.7, -0.03)
  s.lineTo(0.7, 0.27)
  s.lineTo(0.41, 0.36)
  s.lineTo(0.18, 0.5)
  s.quadraticCurveTo(0, 0.43, -0.18, 0.5)
  s.lineTo(-0.41, 0.36)
  s.lineTo(-0.7, 0.27)
  s.lineTo(-0.7, -0.03)
  s.lineTo(-0.41, 0.06)
  s.closePath()
  return s
}

function makeTote(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.38, -0.5)
  s.lineTo(0.38, -0.5)
  s.lineTo(0.38, 0.36)
  s.lineTo(0.22, 0.36)
  s.lineTo(0.22, 0.58)
  s.lineTo(0.12, 0.58)
  s.lineTo(0.12, 0.36)
  s.lineTo(-0.12, 0.36)
  s.lineTo(-0.12, 0.58)
  s.lineTo(-0.22, 0.58)
  s.lineTo(-0.22, 0.36)
  s.lineTo(-0.38, 0.36)
  s.closePath()
  return s
}

const SHAPE_MAP: Record<string, () => THREE.Shape> = {
  tshirt: makeTshirt,
  hoodie: makeHoodie,
  crewneck: makeCrewneck,
  tote: makeTote,
}

function buildGeometry(id: string): THREE.BufferGeometry {
  if (id === 'cap') {
    return new THREE.SphereGeometry(0.38, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  }
  const geo = new THREE.ExtrudeGeometry((SHAPE_MAP[id] ?? makeTshirt)(), EXTRUDE)
  geo.center()
  return geo
}

type StampConfig = { z: number; y: number; scale: number; rotX: number }

const STAMP_CONFIG: Record<string, StampConfig> = {
  cap:      { z: 0.4,  y: 0.12, scale: 0.26, rotX: -Math.PI / 12 },
  tote:     { z: 0.06, y: -0.04, scale: 0.48, rotX: 0 },
  tshirt:   { z: 0.06, y: 0.1,  scale: 0.42, rotX: 0 },
  hoodie:   { z: 0.06, y: 0.1,  scale: 0.44, rotX: 0 },
  crewneck: { z: 0.06, y: 0.1,  scale: 0.42, rotX: 0 },
}

function GarmentMesh({ garment, garmentColor, selectedStamp }: Omit<Viewer3DProps, 'autoRotate'>) {
  const geometry = useMemo(() => buildGeometry(garment.id), [garment.id])

  const stampTexture = useMemo(() => {
    if (!selectedStamp) return null
    const tex = new THREE.TextureLoader().load(drawStampPattern(selectedStamp, 512))
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [selectedStamp?.id])

  useEffect(() => () => { geometry.dispose() }, [geometry])
  useEffect(() => () => { stampTexture?.dispose() }, [stampTexture])

  const sc = STAMP_CONFIG[garment.id] ?? STAMP_CONFIG.tshirt
  const mat = <meshStandardMaterial color={garmentColor} roughness={0.88} metalness={0.03} />

  const stampPlane = stampTexture ? (
    <mesh position={[0, sc.y, sc.z]} rotation={[sc.rotX, 0, 0]}>
      <planeGeometry args={[sc.scale, sc.scale]} />
      <meshBasicMaterial map={stampTexture} transparent depthWrite={false} />
    </mesh>
  ) : null

  if (garment.id === 'cap') {
    return (
      <group>
        <mesh geometry={geometry}>
          <meshStandardMaterial color={garmentColor} roughness={0.88} metalness={0.03} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.03, 0.48]}>
          <boxGeometry args={[0.5, 0.03, 0.22]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          {mat}
        </mesh>
        {stampPlane}
      </group>
    )
  }

  return (
    <group>
      <mesh geometry={geometry}>{mat}</mesh>
      {stampPlane}
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
        <GarmentMesh garment={garment} garmentColor={garmentColor} selectedStamp={selectedStamp} />
        <OrbitControls enablePan={false} enableZoom={true} minDistance={1.8} maxDistance={5.5} minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.2} autoRotate={autoRotate} autoRotateSpeed={0.5} />
        <Environment preset="city" background={false} />
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  )
}
