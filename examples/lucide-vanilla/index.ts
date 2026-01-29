import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Fullscreen, initNodeMaterials, initGlyphNodeMaterials } from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import * as LucideIcons from '@ni2khanna/uikit-lucide'

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

const canvas = document.getElementById('root') as HTMLCanvasElement
const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5

const scene = new Scene()
scene.add(new AmbientLight(undefined, 2))
scene.add(new DirectionalLight(undefined, 1))
scene.add(camera)

const { update } = forwardHtmlEvents(canvas, camera, scene)

const renderer = await createRenderer(canvas)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

// Root
const root = new Fullscreen(renderer, {
  backgroundColor: 0x000000,
  flexDirection: 'column',
  padding: 20,
})
camera.add(root)

// Title
const title = new Text({
  text: 'Lucide Icons',
  fontSize: 24,
  color: 'white',
  fontWeight: 'bold',
  marginBottom: 16,
})
root.add(title)

// Scrollable icon grid
const grid = new Container({
  width: '100%',
  flexGrow: 1,
  overflow: 'scroll',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 4,
  alignContent: 'flex-start',
})
root.add(grid)

// Add icons — filter to only classes that extend Svg (icon classes end with "Icon")
const iconEntries = Object.entries(LucideIcons).filter(
  ([name, value]) => typeof value === 'function' && name.endsWith('Icon'),
)

for (const [name, IconClass] of iconEntries) {
  const cell = new Container({
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    hover: { backgroundColor: 0x333333 },
    cursor: 'pointer',
  })
  grid.add(cell)

  const icon = new (IconClass as any)({
    width: 20,
    height: 20,
    color: 'white',
  })
  cell.add(icon)
}

// Count label
const countLabel = new Text({
  text: `${iconEntries.length} icons`,
  fontSize: 12,
  color: 0x888888,
  marginTop: 8,
})
root.add(countLabel)

// Resize
function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}
updateSize()
window.addEventListener('resize', updateSize)

// Animation loop
let prev: number | undefined
renderer.setAnimationLoop((time: number) => {
  const delta = prev == null ? 0 : time - prev
  prev = time
  update()
  root.update(delta)
  renderer.render(scene, camera)
})
