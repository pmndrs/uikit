import * as THREE from 'three'
import {
  Environment,
  MarchingCubes,
  MarchingCube,
  MeshPortalMaterial,
  useGLTF,
  PerspectiveCamera,
  PivotControls,
  OrbitControls,
  Float,
} from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import { Root, Container, Text, Image, setPreferredColorScheme, Content } from '@react-three/uikit'
import { BellRing, Check, PlusCircle } from '@react-three/uikit-lucide'
import { DefaultColors, colors } from '@/theme.js'
import { Avatar } from '@/avatar.js'
import { Button } from '@/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/card'
import { Switch } from '@/switch'
import { useMemo, useRef } from 'react'
import { signal } from '@preact/signals-core'
import { geometry, easing } from 'maath'

extend(geometry)
setPreferredColorScheme('light')

class Fabric extends THREE.MeshStandardMaterial {
  constructor() {
    super()
    this.transparent = true
  }
}

function Shapes(props) {
  const { nodes, materials } = useGLTF('/smileys-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
        <mesh
          geometry={nodes.helix.geometry}
          material={materials.PaletteMaterial001}
          position={[12.204, -17.913, -51.802]}
          scale={1.238}
        />
      </Float>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
      <mesh
        geometry={nodes.helix001.geometry}
        material={materials.PaletteMaterial001}
        position={[49.688, 12.097, -46.435]}
        scale={1.511}
      />
      </Float>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
      <mesh
        geometry={nodes.torus.geometry}
        material={materials.PaletteMaterial001}
        position={[-43.584, -7.905, -53.486]}
        scale={3.674}
      />
      </Float>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
      <mesh
        geometry={nodes.torus001.geometry}
        material={materials.PaletteMaterial001}
        position={[-23.959, 46.019, -60.892]}
        scale={2.609}
      />
      </Float>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
      <mesh
        geometry={nodes.Star_2.geometry}
        material={materials.PaletteMaterial001}
        position={[0.654, 59.342, -56.876]}
        scale={3.098}
      />
      </Float>
      <Float floatIntensity={30} rotationIntensity={1} speed={1}>
      <mesh
        geometry={nodes.star.geometry}
        material={materials.PaletteMaterial001}
        position={[-40.422, 11.051, -55.515]}
        scale={2.281}
      />
      </Float>
    </group>
  )
}

function Smileys(props) {
  const { nodes, materials } = useGLTF('/smileys-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <Float floatIntensity={30} rotationIntensity={2} speed={2.15} position={[28.048, -5.582, 23.114]}>
        <mesh geometry={nodes.Mesh_13.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_13_1.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_13_2.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={2} speed={1.85} position={[-24.949, 20.943, 22.903]}>
        <mesh geometry={nodes.Mesh_14.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_14_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={2} speed={2.75} position={[11.214, 32.601, 26.715]}>
        <mesh geometry={nodes.Mesh_21.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_21_1.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_21_2.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={2} speed={3.35} position={[-8.126, 5.737, 26.739]}>
        <mesh geometry={nodes.Mesh_32.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_32_1.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_32_2.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={3} speed={2.25} position={[-35.987, 30.172, -31.415]} scale={3.164}>
        <mesh geometry={nodes.Mesh_34.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_34_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={3} speed={1.5} position={[40.289, -21.206, -33.677]} scale={2.785}>
        <mesh geometry={nodes.Mesh_38.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_38_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={3} speed={4} position={[58.183, 19.11, -21.144]} scale={2.448}>
        <mesh geometry={nodes.Mesh_40.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_40_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={3} speed={2.5} position={[37.267, 42.482, -24.19]} scale={2.395}>
        <mesh geometry={nodes.Mesh_41.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_41_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
      <Float floatIntensity={30} rotationIntensity={3} speed={3} position={[-30.785, -15.621, -39.505]} scale={3.5}>
        <mesh geometry={nodes.Mesh_36.geometry} material={materials.PaletteMaterial001} />
        <mesh geometry={nodes.Mesh_36_1.geometry} material={materials.PaletteMaterial001} />
      </Float>
    </group>
  )
}

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 35 }}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true }}
    >
      <ambientLight intensity={Math.PI} />
      <Root pixelSize={0.01}>
        <DefaultColors>
          <CardPage />
        </DefaultColors>
      </Root>
      <Environment preset="city" />
      <Shapes scale={0.05} position={[0, 1, 10]} />
      <Rig />
      <OrbitControls />
    </Canvas>
  )
}

function Rig() {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [state.pointer.x, state.pointer.y, 18], 0.35, delta)
    state.camera.lookAt(0, 0, -10)
  })
}

const notifications = [
  {
    title: 'Your call has been confirmed.',
    description: '1 hour ago',
  },
]

function MetaBall({ color, vec = new THREE.Vector3(), ...props }) {
  const api = useRef()
  useFrame((state, delta) => {
    delta = Math.min(delta, 0.1)
    api.current.applyImpulse(
      vec
        .copy(api.current.translation())
        .normalize()
        .multiplyScalar(delta * -0.05),
    )
  })
  return (
    <RigidBody ref={api} colliders={false} linearDamping={4} angularDamping={0.95} {...props}>
      <MarchingCube strength={0.35} subtract={6} color={color} />
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3(), dir = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ pointer, viewport, camera }) => {
    const { width, height } = viewport
    vec.set(pointer.x * (width / 10), pointer.y * (height / 10) - 0.25, 0)
    ref.current.setNextKinematicTranslation(vec)
  })
  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <MarchingCube strength={0.5} subtract={10} color="white" />
      <BallCollider args={[0.25]} type="dynamic" />
    </RigidBody>
  )
}

export function CardPage() {
  const openRef = useRef(false)
  const translateY = useMemo(() => signal(-460), [])
  const translateZ = useMemo(() => signal(0), [])
  useFrame((_, delta) => {
    easing.damp(translateY, 'value', openRef.current ? 0 : -460, 0.2, delta)
    easing.damp(translateZ, 'value', openRef.current ? 200 : 0, 0.2, delta)
  })
  return (
    <Root pixelSize={0.01} sizeX={4.4}>
      <DefaultColors>
        <Container
          backgroundColor={0xffffff}
          dark={{ backgroundColor: 0x0 }}
          borderRadius={20}
          onClick={(e) => {
            e.stopPropagation()
            openRef.current = !openRef.current
          }}
          cursor="pointer"
          zIndexOffset={1}
          transformTranslateZ={translateZ}
        >
          <Content transformTranslateZ={1} padding={14} keepAspectRatio={false} width="100%" height={400}>
            <mesh>
              <roundedPlaneGeometry args={[1, 1, 0.025]} />
              <MeshPortalMaterial>
                <color attach="background" args={['white']} />
                <ambientLight intensity={Math.PI} />
                <Environment preset="city" />
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={20} />
                <group position={[0, 1, 0]}>
                  <Smileys scale={0.02} position={[0, 0, -10]} />
                </group>
              </MeshPortalMaterial>
            </mesh>
          </Content>
          <Container
            backgroundColor={0xffffff}
            dark={{ backgroundColor: 0x0 }}
            flexDirection="row"
            padding={28}
            paddingTop={28 + 4}
            alignItems="center"
            justifyContent="space-between"
            borderRadiusBottom={20}
          >
            <Container gap={8}>
              <Text fontWeight="normal" fontSize={24} lineHeight={1}>
                VanArsdel Marketing
              </Text>
              <Text fontSize={20} fontWeight="medium" letterSpacing={-0.4} color={colors.primary}>
                1 activities for you
              </Text>
            </Container>
            <Container flexDirection="row" gap={-6}>
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Scot" />
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Theo" />
              <Avatar width={40} src="https://avatar.iran.liara.run/public/boy?username=Paul" />
            </Container>
          </Container>
        </Container>
        <Container transformTranslateY={-40} overflow="hidden">
          <Container
            paddingTop={40}
            transformTranslateY={translateY}
            backgroundColor={colors.secondary}
            borderRadius={20}
          >
            <CardHeader>
              <CardTitle>
                <Text>Notifications</Text>
              </CardTitle>
              <CardDescription>
                <Text>You have 3 unread messages.</Text>
              </CardDescription>
            </CardHeader>
            <CardContent flexDirection="column" gap={16}>
              <Container flexDirection="row" alignItems="center" gap={16} borderRadius={6} border={1} padding={16}>
                <BellRing />
                <Container gap={4}>
                  <Text fontSize={14} lineHeight={1}>
                    Push Notifications
                  </Text>
                  <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
                    Send notifications to device.
                  </Text>
                </Container>
                <Container flexGrow={1} />
                <Switch />
              </Container>
              <Container>
                {notifications.map((notification, index) => (
                  <Container
                    key={index}
                    marginBottom={index === notifications.length - 1 ? 0 : 16}
                    paddingBottom={index === notifications.length - 1 ? 0 : 16}
                    alignItems="flex-start"
                    flexDirection="row"
                    gap={17}
                  >
                    <Container
                      height={8}
                      width={8}
                      transformTranslateY={4}
                      borderRadius={1000}
                      backgroundColor={colors.primary}
                    />
                    <Container gap={4}>
                      <Text fontSize={14} lineHeight={1}>
                        {notification.title}
                      </Text>
                      <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
                        {notification.description}
                      </Text>
                    </Container>
                  </Container>
                ))}
              </Container>
            </CardContent>
            <CardFooter>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  openRef.current = !openRef.current
                }}
                flexDirection="row"
                width="100%"
              >
                <Check marginRight={8} height={16} width={16} />
                <Text>Mark all as read</Text>
              </Button>
            </CardFooter>
          </Container>
        </Container>
      </DefaultColors>
    </Root>
  )
}
