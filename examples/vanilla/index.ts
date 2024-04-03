import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { EventHandlers, reversePainterSortStable, Container, Root, Image, Text, SVG } from '@vanilla-three/uikit'
import { Delete } from '@vanilla-three/uikit-lucide'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 10

const scene = new Scene()

const canvas = document.getElementById('root') as HTMLCanvasElement
const controls = new OrbitControls(camera, canvas)

function handlerToEventName(key: string) {
  return key[2].toLocaleLowerCase() + key.slice(3)
}

const renderer = new WebGLRenderer({ antialias: true, canvas })

//UI
const root = new Root(
  {
    bindEventHandlers(object, handlers) {
      for (const key in handlers) {
        const handler = handlers[key as keyof EventHandlers]
        if (handler == null) {
          continue
        }
        object.addEventListener(handlerToEventName(key), handler as any)
      }
    },
    unbindEventHandlers(object, handlers) {
      for (const key in handlers) {
        const handler = handlers[key as keyof EventHandlers]
        if (handler == null) {
          continue
        }
        object.removeEventListener(handlerToEventName(key), handler as any)
      }
    },
  },
  camera,
  renderer,
  scene,
  {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    sizeX: 15,
    sizeY: 5,
    alignItems: 'center',
    backgroundColor: 'red',
  },
)
new Delete(root, { width: 100 })
new SVG(root, 'example.svg', { height: '50%' })
new Text(root, 'Hello World', undefined, { fontSize: 50 })
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
