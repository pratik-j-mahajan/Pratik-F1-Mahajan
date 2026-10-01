import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/*
  The pit-lane car: a side view that drives along the track under the case studies.
  `at` is a motion value 0 → 1 = where along the track the car is. The car turns the
  change into speed: its wheels spin with distance, it squats under acceleration and
  dips its nose under braking, then settles when parked at a pit box.
*/
const MODEL = '/models/car.glb'
const FLOOR = -1.137
const LENGTH = 11.6 // model length in its own units
const WHEEL = /tires|rim|bujon|disk|lid/i

const MAT = {
  body: new THREE.MeshPhysicalMaterial({ color: '#0f1a3d', metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
  carbon: new THREE.MeshPhysicalMaterial({ color: '#15161b', metalness: 0.35, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
  red: new THREE.MeshPhysicalMaterial({ color: '#e10600', metalness: 0.3, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#0c0c0d', roughness: 0.9 }),
  rim: new THREE.MeshStandardMaterial({ color: '#34363c', metalness: 0.9, roughness: 0.25 }),
  cockpit: new THREE.MeshStandardMaterial({ color: '#1b1c20', roughness: 0.7 }),
  light: new THREE.MeshStandardMaterial({ color: '#330000', emissive: '#ff1a1a', emissiveIntensity: 1.2 }),
}

function materialFor(name) {
  const n = name.toLowerCase()
  if (/lid/.test(n)) return MAT.red
  if (/tires/.test(n)) return MAT.rubber
  if (/rim|bujon|disk/.test(n)) return MAT.rim
  if (/^lights/.test(n)) return MAT.light
  if (/back_?wing|pitot|drs/.test(n)) return MAT.red
  if (/^(body|cabin|fender|chassis)/.test(n)) return MAT.body
  if (/seat|belt|control|shifter|switch|clip|lock|tube/.test(n)) return MAT.cockpit
  return MAT.carbon
}

function Car({ at, onReady }) {
  const { scene } = useGLTF(MODEL)
  const { viewport } = useThree()
  const rig = useRef()
  const last = useRef(null)
  const vel = useRef(0)

  // clone, repaint, and put every wheel part on a pivot at its own centre so it can spin
  const { car, wheels } = useMemo(() => {
    const root = scene.clone(true)
    const wheels = []
    const parts = []
    root.traverse((o) => o.isMesh && parts.push(o))
    parts.forEach((m) => {
      m.material = materialFor(m.name)
      if (!WHEEL.test(m.name)) return
      const box = new THREE.Box3().setFromObject(m)
      const pivot = new THREE.Group()
      box.getCenter(pivot.position)
      root.add(pivot)
      pivot.attach(m)
      wheels.push(pivot)
    })
    return { car: root, wheels }
  }, [scene])

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    // `at` is a fraction of the canvas width; the car's centre sits on it (and so on the pit box)
    const x = (at.get() - 0.5) * viewport.width
    const prev = last.current ?? x
    last.current = x
    const dx = x - prev
    const v = d > 0 ? dx / d : 0
    const accel = (v - vel.current) / Math.max(d, 1e-3)
    vel.current = THREE.MathUtils.damp(vel.current, v, 6, d)

    if (rig.current) rig.current.position.x = x
    // wheels roll with distance travelled (radius ≈ 0.78 in model units)
    wheels.forEach((w) => (w.rotation.x += dx / 0.78))
    // squat under acceleration, nose-dip under braking — a few degrees at most
    if (rig.current) {
      const pitch = THREE.MathUtils.clamp(accel * 0.0009, -0.035, 0.035)
      rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, pitch, 8, d)
    }
  })

  return (
    <group ref={rig}>
      {/* nose along +x (screen right) */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <primitive object={car} position={[0, -FLOOR, 0]} />
      </group>
      {/* soft contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[LENGTH * 1.05, 4.6]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function PitCar({ at, onReady }) {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.4, 40], zoom: 25, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 2.1, 0)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-6, 10, 8]} intensity={1.6} />
      <directionalLight position={[8, 4, -6]} intensity={1.4} color="#ff3b30" />
      <Car at={at} onReady={onReady} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 8, 4]} rotation-x={Math.PI / 2} scale={[20, 4, 1]} />
        <Lightformer intensity={1} position={[0, 2, 10]} scale={[30, 2, 1]} />
      </Environment>
    </Canvas>
  )
}

useGLTF.preload(MODEL)
