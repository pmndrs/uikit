import {
  AmbientLight,
  BaseEvent,
  Intersection,
  Mesh,
  PerspectiveCamera,
  Scene,
  Sphere,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import {
  reversePainterSortStable,
  Container,
  Fullscreen,
  Image,
  Text,
  Svg,
  Content,
  Root,
  ThreeEvent,
} from '@pmndrs/uikit'
import { Delete } from '@pmndrs/uikit-lucide'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5

const scene = new Scene()
scene.add(new AmbientLight(undefined, 2))
scene.add(camera)

const canvas = document.getElementById('root') as HTMLCanvasElement

const controls = new OrbitControls(camera, canvas)

const renderer = new WebGLRenderer({ antialias: true, canvas })

const position = new Vector3(0, 0, 0.199)
const sphere = new Sphere(position, 0.2)
const sphereMesh = new Mesh(new SphereGeometry(0.2))
sphereMesh.position.copy(position)
scene.add(sphereMesh)

//UI
const root = new Root(camera, renderer, {
  flexDirection: 'row',
  gap: 30,
  width: 1000,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  backgroundColor: 'red',
  overflow: 'scroll',
})
scene.add(root)

setTimeout(() => {
  const intersections: Array<Intersection> = []
  root.internals.interactionPanel.spherecast?.(sphere, intersections)
  console.log(intersections)
}, 1000)

const c = new Content({ flexShrink: 0, height: 100, backgroundColor: 'black' })
const loader = new GLTFLoader()
loader.load('example.glb', (gltf) => c.add(gltf.scene))
const del = new Delete({ onClick: () => {}, width: 100, flexShrink: 0 })
const svg = new Svg({ src: 'example.svg', width: 100, height: 100, flexShrink: 0 })
const text = new Text('Hello World', { fontSize: 40, flexShrink: 0 })
const a = new Container({ flexShrink: 0, alignSelf: 'stretch', flexGrow: 1, backgroundColor: 'blue' })
const x = new Container({
  flexShrink: 0,
  padding: 20,
  height: '100%',
  flexGrow: 1,
  hover: { backgroundColor: 'yellow' },
  backgroundColor: 'green',
  flexBasis: 0,
  justifyContent: 'center',
  onSizeChange: console.log,
})
setTimeout(() => {
  x.dispatchEvent({
    type: 'pointerover',
    distance: 0,
    nativeEvent: {} as any,
    object: x,
    point: new Vector3(),
    pointerId: -1,
  })
}, 0)
const img = new Image({
  src: 'https://picsum.photos/300/300',
  borderRadius: 1000,
  aspectRatio: 1,
  height: '100%',
  flexShrink: 0,
})
root.add(del, svg, text, x, img)
x.add(a)

renderer.setAnimationLoop(animation)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

updateSize()
window.addEventListener('resize', updateSize)

// animation

let prev: number | undefined
function animation(time: number) {
  const delta = prev == null ? 0 : time - prev
  prev = time

  controls.update(delta)
  root.update(delta)

  renderer.render(scene, camera)
}
