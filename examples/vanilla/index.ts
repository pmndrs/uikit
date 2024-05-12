import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Fullscreen, Image, Text, Svg, Content } from '@pmndrs/uikit'
import { Delete } from '@pmndrs/uikit-lucide'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10

const scene = new Scene()
scene.add(new AmbientLight(undefined, 2))
scene.add(camera)

const canvas = document.getElementById('root') as HTMLCanvasElement

const renderer = new WebGLRenderer({ antialias: true, canvas })

//UI
const root = new Fullscreen(renderer, undefined, {
  flexDirection: 'row',
  gap: 30,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  backgroundColor: 'red',
  overflow: 'scroll',
})
camera.add(root)
const c = new Content({ flexShrink: 0, height: 100, backgroundColor: 'black' })
const loader = new GLTFLoader()
loader.load('example.glb', (gltf) => c.add(gltf.scene))
const del = new Delete({ width: 100, flexShrink: 0 })
const svg = new Svg({ src: 'example.svg', height: '20%', flexShrink: 0 })
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
setTimeout(() => x.dispatchEvent({ type: 'pointerOver', target: x, nativeEvent: { pointerId: 1 } } as any), 0)
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
  root.updateSize()
}

updateSize()
window.addEventListener('resize', updateSize)

// animation

let prev: number | undefined
function animation(time: number) {
  const delta = prev == null ? 0 : time - prev
  prev = time

  root.update(delta)

  renderer.render(scene, camera)
}
