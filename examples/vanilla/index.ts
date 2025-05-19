import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Image, Content, Svg, StyleSheet } from '@pmndrs/uikit'
import { Delete } from '@pmndrs/uikit-lucide'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { OrbitHandles } from '@pmndrs/handle'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5

const scene = new Scene()
scene.add(new AmbientLight(undefined, 2))
scene.add(camera)

const canvas = document.getElementById('root') as HTMLCanvasElement

const { update } = forwardHtmlEvents(canvas, camera, scene)
const orbit = new OrbitHandles(canvas, camera)
orbit.bind(scene)

const renderer = new WebGLRenderer({ antialias: true, canvas })

//UI
const root = new Container({
  flexDirection: 'row',
  gap: 30,
  width: 1000,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  backgroundColor: 'red',
  overflow: 'scroll',
  backgroundOpacity: 1,
})
scene.add(root)

const c = new Content({ flexShrink: 0, height: 100, width: 100, backgroundColor: 'black' })
const loader = new GLTFLoader()
loader.load('example.glb', (gltf) => {
  c.add(gltf.scene)
})
const del = new Delete({ onClick: () => {}, width: 100, flexShrink: 0 })
const svg = new Svg({
  src: 'example.svg',
  width: 100,
  height: 100,
  flexShrink: 0,
  backgroundColor: 'white',
  backgroundOpacity: 1,
})
const text = new Text({ text: 'Hello World', fontSize: 40, flexShrink: 0 })
const a = new Container({
  flexShrink: 0,
  alignSelf: 'stretch',
  height: 100,
  width: 100,
  backgroundColor: 'blue',
  hover: { backgroundColor: 'black' },
})

StyleSheet['test'] = {
  hover: { backgroundColor: 'yellow' },
}
const x = new Container(
  {
    flexShrink: 0,
    padding: 50,
    height: 300,
    flexGrow: 1,
    backgroundColor: 'green',
    flexBasis: 0,
    justifyContent: 'flex-start',
    onClick: () => {
      x.classList.toggle('test')
    },
  },
  ['test'],
)
const img = new Image({
  src: 'https://picsum.photos/300/300',
  borderRadius: 1000,
  aspectRatio: 1,
  width: 100,
  padding: 10,
  opacity: 0.5,
  backgroundColor: 'blue',
  flexShrink: 0,
})
root.add(img, c, del, svg, text, x)
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

  update()
  orbit.update(delta)
  root.update(delta)

  renderer.render(scene, camera)
}
