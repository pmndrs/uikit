import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, TTFLoader, initNodeMaterials, initGlyphNodeMaterials } from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import fontUrl from './BitcountPropSingle-Regular.ttf?url'

// Renderer selection via URL parameter: ?renderer=webgpu
async function createRenderer(canvas: HTMLCanvasElement) {
  const params = new URLSearchParams(window.location.search)
  if (params.get('renderer') === 'webgpu') {
    const { WebGPURenderer } = await import('three/webgpu')
    const renderer = new WebGPURenderer({ antialias: true, canvas })
    await renderer.init()
    await Promise.all([initNodeMaterials(), initGlyphNodeMaterials()])
    return renderer
  }
  return new WebGLRenderer({ antialias: true, canvas })
}

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5

const scene = new Scene()
scene.background = new Color('black')

const canvas = document.getElementById('root') as HTMLCanvasElement
const { update } = forwardHtmlEvents(canvas, camera, scene)

const renderer = await createRenderer(canvas)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

async function init() {
  const loader = new TTFLoader()
  const fontFamilies = await loader.loadAsync(fontUrl)

  const root = new Container({
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    fontFamilies,
  })
  root.position.z = -2
  scene.add(root)

  const title = new Text({
    fontSize: 48,
    color: 'white',
    text: 'TTF Loader Example',
  })
  root.add(title)

  const subtitle = new Text({
    fontSize: 24,
    color: 'gray',
    text: 'Loading fonts at runtime with @pmndrs/uikit-ttf',
  })
  root.add(subtitle)

  // animation loop
  let prev: number | undefined
  function animation(time: number) {
    const delta = prev == null ? 0 : time - prev
    prev = time

    update()
    root.update(delta)

    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(animation)
}

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

updateSize()
window.addEventListener('resize', updateSize)

init()
