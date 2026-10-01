import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import ModelCar from './ModelCar.jsx'
import { panelTexture, screenTexture, textTexture } from './textures.js'

/*
  Camera stops, orbiting the car. `angle` is degrees around the car (0 = rear, 90 = left side),
  kept increasing so the camera always swings the same way round.
*/
export const CAMERA_STOPS = [
  { angle: 82, radius: 7.4, height: 1.7, look: [0, 0.5, 0] }, // full side view
  { angle: 146, radius: 5.2, height: 1.15, look: [-0.9, 0.45, 0] }, // front three-quarter, closer
  { angle: 282, radius: 4.1, height: 1.35, look: [0.1, 0.55, 0] }, // other side, closer
  { angle: 326, radius: 4.6, height: 1.45, look: [1.4, 0.6, 0] }, // rear, very close
  { angle: 360, radius: 2.35, height: 0.45, look: [0.4, 0.35, 0] }, // dive into the back
]

const SMOOTH = 1.9 // lower = lazier camera

function CameraRig({ stage }) {
  const cur = useRef({ ...CAMERA_STOPS[0], look: new Vector3(...CAMERA_STOPS[0].look) })
  const lookTarget = useMemo(() => new Vector3(), [])

  useFrame(({ camera, pointer }, dt) => {
    const t = CAMERA_STOPS[stage]
    const k = 1 - Math.exp(-dt * SMOOTH)
    const c = cur.current
    c.angle = MathUtils.lerp(c.angle, t.angle, k)
    c.radius = MathUtils.lerp(c.radius, t.radius, k)
    c.height = MathUtils.lerp(c.height, t.height, k)
    c.look.lerp(lookTarget.set(...t.look), k)

    // a touch of mouse parallax
    const a = MathUtils.degToRad(c.angle + pointer.x * 3)
    camera.position.set(Math.cos(a) * c.radius, c.height + pointer.y * 0.12, Math.sin(a) * c.radius)
    camera.lookAt(c.look)
  })
  return null
}

function TyreStack({ position, band }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.17 + i * 0.33, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.32, 40]} />
            <meshStandardMaterial color="#121212" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.162, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.012, 8, 48]} />
            <meshStandardMaterial color={band} emissive={band} emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Room() {
  const tex = useMemo(() => {
    const panels = panelTexture()
    panels.repeat.set(10, 2)
    return {
      panels,
      title: textTexture('PRATIK RACING  ·  GARAGE 06', { width: 2048, height: 160, font: '500 72px Poppins, sans-serif', color: 'rgba(255,255,255,0.35)' }),
      big: textTexture('06', { width: 1024, height: 512, font: '600 460px Jost, Poppins, sans-serif', stroke: 'rgba(255,255,255,0.08)' }),
      screen: screenTexture(),
    }
  }, [])

  const W = 22
  const D = 16
  const H = 6

  return (
    <group>
      {/* walls */}
      {[
        [0, H / 2, -D / 2, 0],
        [0, H / 2, D / 2, Math.PI],
        [-W / 2, H / 2, 0, Math.PI / 2],
        [W / 2, H / 2, 0, -Math.PI / 2],
      ].map(([x, y, z, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]} receiveShadow>
          <planeGeometry args={[i < 2 ? W : D, H]} />
          <meshStandardMaterial map={tex.panels} roughness={0.8} />
        </mesh>
      ))}

      {/* team stripes along the walls */}
      {[
        [0, -D / 2 + 0.01, 0, W],
        [0, D / 2 - 0.01, Math.PI, W],
        [-W / 2 + 0.01, 0, Math.PI / 2, D],
        [W / 2 - 0.01, 0, -Math.PI / 2, D],
      ].map(([x, z, ry, len], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
          <mesh position={[0, 1.05, 0]}>
            <planeGeometry args={[len, 0.07]} />
            <meshStandardMaterial color="#e10600" emissive="#e10600" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <planeGeometry args={[len, 0.05]} />
            <meshStandardMaterial color="#f5c400" emissive="#f5c400" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* wall graphics (both long walls) */}
      {[
        [-D / 2 + 0.02, 0],
        [D / 2 - 0.02, Math.PI],
      ].map(([z, ry], i) => (
        <group key={i} position={[0, 0, z]} rotation={[0, ry, 0]}>
          <mesh position={[0, 3.2, 0]}>
            <planeGeometry args={[9, 4.5]} />
            <meshBasicMaterial map={tex.big} transparent depthWrite={false} />
          </mesh>
          <mesh position={[0, 4.6, 0.01]}>
            <planeGeometry args={[8, 0.62]} />
            <meshBasicMaterial map={tex.title} transparent depthWrite={false} />
          </mesh>
          <mesh position={[5.6, 2.4, 0.02]}>
            <planeGeometry args={[2.2, 1.24]} />
            <meshBasicMaterial map={tex.screen} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ceiling + light strips */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#07080c" />
      </mesh>
      {[-3, -1, 1, 3].map((z) => (
        <mesh key={z} position={[0, H - 0.05, z]}>
          <boxGeometry args={[7, 0.05, 0.16]} />
          <meshStandardMaterial color="#fff" emissive="#eef3ff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}

      {/* pit box markings */}
      {[
        [0, -1.6, 7.4, 0.06],
        [0, 1.6, 7.4, 0.06],
        [-3.7, 0, 0.06, 3.26],
        [3.7, 0, 0.06, 3.26],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#f5c400" emissive="#f5c400" emissiveIntensity={0.25} />
        </mesh>
      ))}

      {/* props */}
      <TyreStack position={[-6.2, 0, -4.5]} band="#e10600" />
      <TyreStack position={[-5.3, 0, -5.4]} band="#f5c400" />
      <TyreStack position={[6.4, 0, 4.6]} band="#f2f2f2" />
      <TyreStack position={[5.6, 0, 5.5]} band="#e10600" />
      {/* tool chest */}
      <group position={[6.2, 0, -5.6]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.8, 1.1, 0.7]} />
          <meshPhysicalMaterial color="#0f1d52" metalness={0.6} roughness={0.35} />
        </mesh>
        {[0.25, 0.5, 0.75].map((y) => (
          <mesh key={y} position={[0, y, 0.351]}>
            <planeGeometry args={[1.6, 0.02]} />
            <meshStandardMaterial color="#e10600" emissive="#e10600" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function GarageScene({ stage, onReady }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 34, near: 0.1, far: 60, position: [1, 1.7, 7.4] }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 10, 24]} />

      <ambientLight intensity={0.35} />
      <spotLight
        position={[0, 5.6, 0]}
        angle={0.75}
        penumbra={0.8}
        intensity={90}
        distance={14}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-5, 3, 4]} intensity={8} color="#8aa4ff" />
      <pointLight position={[5, 3, -4]} intensity={8} color="#ff6a5a" />

      {/* studio reflections for the paint, generated locally (no HDR download) */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 2, 6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 2, -6]} rotation-y={Math.PI} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ff3b2f" position={[-7, 1.5, 0]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#4d7cff" position={[7, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} />
      </Environment>

      <Room />

      {/* glossy epoxy floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 16]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={18}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0b0c11"
          metalness={0.5}
        />
      </mesh>

      <Suspense fallback={null}>
        <ModelCar onLoaded={onReady} />
      </Suspense>
      <ContactShadows position={[0, 0.005, 0]} scale={9} blur={2.4} far={2} opacity={0.75} />

      <CameraRig stage={stage} />
    </Canvas>
  )
}
