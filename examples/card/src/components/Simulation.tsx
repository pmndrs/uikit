import * as THREE from 'three'
import { useGLTF, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Physics, RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'

// Shapes by https://app.spline.design/library/a4eeaee4-be03-4df8-ab05-5a073eda2eb4
export function Floating(props: any) {
  const { nodes, materials } = useGLTF('/uikit/examples/card/smileys-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <Float>
        <mesh
          geometry={(nodes.hash as any).geometry}
          material={materials.PaletteMaterial001}
          position={[-4.095, 1.891, -2.58]}
          scale={0.216}
        />
      </Float>
      <Float>
        <mesh
          geometry={(nodes.star001 as any).geometry}
          material={materials.PaletteMaterial001}
          position={[2.932, -2.747, -2.807]}
          scale={0.278}
        />
      </Float>
      <Float>
        <mesh
          geometry={(nodes.play as any).geometry}
          material={materials.PaletteMaterial001}
          position={[3.722, 0.284, -1.553]}
          scale={0.245}
        />
      </Float>
      <Float>
        <mesh
          geometry={(nodes.points as any).geometry}
          material={materials.PaletteMaterial001}
          position={[3, 2.621, -1.858]}
          scale={0.239}
        />
      </Float>
      <Float>
        <mesh
          geometry={(nodes.Ellipse as any).geometry}
          material={materials.PaletteMaterial001}
          position={[-3.275, -1, -3.389]}
          scale={0.317}
        />
      </Float>
    </group>
  )
}

export function Physical() {
  const { nodes, materials } = useGLTF('/uikit/examples/card/smileys-transformed.glb')
  const meshes = useMemo(() => Object.values(nodes).filter((node) => 'isMesh' in node), [nodes])
  return (
    <Physics gravity={[0, 0, 0]}>
      {meshes.map((mesh) => (
        <RigidShape key={mesh.uuid} mesh={mesh as THREE.Mesh} />
      ))}
      <Pointer />
    </Physics>
  )
}

function RigidShape({ mesh, vec = new THREE.Vector3() }: { mesh: THREE.Mesh; vec?: THREE.Vector3 }) {
  const api = useRef<RapierRigidBody>(null)
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta)
    api.current?.applyImpulse(
      vec.copy(api.current.translation()).negate().add({ x: 0, y: 2, z: 0 }).multiplyScalar(0.2),
      false,
    )
  })
  return (
    <RigidBody
      ref={api}
      scale={0.2}
      position={[
        THREE.MathUtils.randFloatSpread(10),
        THREE.MathUtils.randFloatSpread(10),
        THREE.MathUtils.randFloatSpread(10),
      ]}
      linearDamping={4}
      angularDamping={1}
      friction={0.1}
      colliders="ball"
    >
      <mesh geometry={mesh.geometry} material={mesh.material} />
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef<RapierRigidBody>(null)
  useFrame(({ mouse, viewport }) => {
    ref.current?.setNextKinematicTranslation(
      vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0),
    )
  })
  return (
    <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[2]} />
    </RigidBody>
  )
}
