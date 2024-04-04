import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
  EventHandlers,
  reversePainterSortStable,
  Container,
  Root,
  Image,
  Text,
  SVG,
  Content,
} from '@vanilla-three/uikit'
import { Delete } from '@vanilla-three/uikit-lucide'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10

const scene = new Scene()
scene.add(new AmbientLight(undefined, 2))

const canvas = document.getElementById('root') as HTMLCanvasElement
const controls = new OrbitControls(camera, canvas)

function handlerToEventName(key: string) {
  return key[2].toLocaleLowerCase() + key.slice(3)
}

const renderer = new WebGLRenderer({ antialias: true, canvas })

//UI
const root = new Root(camera, renderer, scene, undefined, {
  flexDirection: 'row',
  gap: 10,
  padding: 10,
  sizeX: 15,
  sizeY: 5,
  alignItems: 'center',
  backgroundColor: 'red',
})
const c = new Content(root, { height: 100, backgroundColor: 'black' })
const loader = new GLTFLoader()
loader.load('example.glb', (gltf) => c.setContent(gltf.scene))
new Delete(root, { width: 100 })
new SVG(root, 'example.svg', { height: '20%' })
new Text(root, 'Hello World', { fontSize: 40 })
new Container(root, { alignSelf: 'stretch', flexGrow: 1, backgroundColor: 'blue' })
const x = new Container(root, {
  padding: 30,
  flexGrow: 1,
  hover: { backgroundColor: 'yellow' },
  backgroundColor: 'green',
})
x.dispatchEvent({ type: 'pointerOver', target: x, nativeEvent: { pointerId: 1 } } as any)
new Image(x, 'https://picsum.photos/300/300', {
  borderRadius: 1000,
  height: '100%',
  flexBasis: 0,
  flexGrow: 1,
})

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

  root.update(delta)
  controls.update(delta)

  renderer.render(scene, camera)
}
