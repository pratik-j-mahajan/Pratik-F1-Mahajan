import { useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { Box3, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { USDLoader } from 'three/addons/loaders/USDLoader.js'

// Car model: .glb/.gltf or .usdz (textures packed inside).
export const MODEL_URL = '/models/red-bull-rb6.usdz'
const isUsd = /\.usdz?$/i.test(MODEL_URL)
// Turn by Math.PI if the nose ends up pointing the wrong way (it should point to −x).
const MODEL_ROTATION_Y = Math.PI
const TARGET_LENGTH = 5

const boxOf = (obj) => {
  obj.updateMatrixWorld(true)
  return new Box3().setFromObject(obj)
}

// Stands the model upright, lays it along x, scales it to ~5 units and rests it on the floor.
export default function ModelCar({ onLoaded }) {
  const result = useLoader(isUsd ? USDLoader : GLTFLoader, MODEL_URL)
  const loaded = isUsd ? result : result.scene

  const car = useMemo(() => {
    const model = loaded.clone(true)
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })

    // A car's shortest side is its height: make that the y axis
    const s = boxOf(model).getSize(new Vector3())
    if (s.z < s.y && s.z <= s.x) model.rotation.x = -Math.PI / 2
    else if (s.x < s.y && s.x <= s.z) model.rotation.z = Math.PI / 2

    // Longest horizontal side along x
    const turn = new Group()
    turn.add(model)
    const s2 = boxOf(turn).getSize(new Vector3())
    turn.rotation.y = (s2.z > s2.x ? Math.PI / 2 : 0) + MODEL_ROTATION_Y

    // Scale, centre and put the wheels on the floor
    const root = new Group()
    root.add(turn)
    const box = boxOf(root)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const k = TARGET_LENGTH / Math.max(size.x, size.z)
    root.scale.setScalar(k)
    root.position.set(-center.x * k, -box.min.y * k, -center.z * k)
    return root
  }, [loaded])

  useEffect(() => onLoaded?.(), [onLoaded])

  return <primitive object={car} />
}
