import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Image, Content, Svg, StyleSheet, Video, Input } from '@pmndrs/uikit'
import { Delete } from '@pmndrs/uikit-lucide'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { OrbitHandles } from '@pmndrs/handle'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  Button,
  themeRootProperties,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerIcon,
} from '@pmndrs/uikit-default'

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
  ...themeRootProperties,
  flexDirection: 'row',
  gap: 30,
  width: 400,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  backgroundColor: 'black',
  overflow: 'scroll',
})
scene.add(root)

const c = new Content({
  flexShrink: 0,
  hover: { backgroundColor: 'pink' },
  height: 100,
  width: 100,
  backgroundColor: 'black',
})
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
  color: null,
  backgroundColor: 'white',
  backgroundOpacity: 1,
})
const text = new Text({ text: 'Hello World', fontSize: 40, flexShrink: 0 })
const input = new Input({ defaultValue: 'test', color: 'white', fontSize: 40, flexShrink: 0 })
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
const video = new Video({
  src: 'example.mp4',
  width: 300,
  autoplay: true,
  muted: true,
  loop: true,
  flexShrink: 0,
})
const btn = new Button({ flexShrink: 0, variant: 'outline' })
btn.add(new Text({ text: 'Press me!' }))

const accordion = new Accordion({ width: '100%' })
const item1 = new AccordionItem({ value: 'item1' })
accordion.add(item1)
const item1Trigger = new AccordionTrigger()
item1.add(item1Trigger)
item1Trigger.add(new Text({ text: 'Getting Started' }))
const item1TriggerIcon = new AccordionTriggerIcon()
item1Trigger.add(item1TriggerIcon)
const item1Content = new AccordionContent()
item1.add(item1Content)
item1Content.add(
  new Text({
    text: 'Welcome to our platform! Here you can find quick start guides, tutorials, and documentation to help you get up and running quickly.',
  }),
)

const item2 = new AccordionItem({ value: 'item2' })
accordion.add(item2)
const item2Trigger = new AccordionTrigger()
item2.add(item2Trigger)
item2Trigger.add(new Text({ text: 'Frequently Asked Questions' }))
const item2TriggerIcon = new AccordionTriggerIcon()
item2Trigger.add(item2TriggerIcon)
const item2Content = new AccordionContent()
item2.add(item2Content)
item2Content.add(
  new Text({
    text: 'Find answers to common questions about our services, pricing, features, and technical requirements. Our FAQ section is regularly updated to provide the most relevant information.',
  }),
)

root.add(accordion)
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
