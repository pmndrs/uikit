import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text } from '@pmndrs/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { OrbitHandles } from '@pmndrs/handle'
import {
  Button,
  defaultProperties,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerIcon,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Video,
  setTheme,
  defaultThemes,
  colors,
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

setTheme(defaultThemes.red)

//UI
const root = new Container({
  ...defaultProperties,
  flexDirection: 'column',
  gap: 30,
  width: 1024,
  height: 512,
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  backgroundColor: colors.background,
  overflow: 'hidden',
})
scene.add(root)

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

// Create Alert Dialog
const alertDialog = new AlertDialog()
root.add(alertDialog)

const alertDialogTrigger = new AlertDialogTrigger({ dialog: alertDialog })
const alertDialogTriggerButton = new Button({ variant: 'outline' })
alertDialogTriggerButton.add(new Text({ text: 'Show Alert Dialog' }))
alertDialogTrigger.add(alertDialogTriggerButton)

const alertDialogContent = new AlertDialogContent()
alertDialog.add(alertDialogContent)

const alertDialogHeader = new AlertDialogHeader()
alertDialogContent.add(alertDialogHeader)

const alertDialogTitle = new AlertDialogTitle()
alertDialogTitle.add(new Text({ text: 'Are you absolutely sure?' }))
alertDialogHeader.add(alertDialogTitle)

const alertDialogDescription = new AlertDialogDescription()
alertDialogDescription.add(
  new Text({
    text: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  }),
)
alertDialogHeader.add(alertDialogDescription)

const alertDialogFooter = new AlertDialogFooter()
alertDialogContent.add(alertDialogFooter)

const alertDialogCancel = new AlertDialogCancel()
alertDialogCancel.add(new Text({ text: 'Cancel' }))
alertDialogFooter.add(alertDialogCancel)

const alertDialogAction = new AlertDialogAction()
alertDialogAction.add(new Text({ text: 'Continue' }))
alertDialogFooter.add(alertDialogAction)

// Create Video component
const video = new Video({
  src: 'example.mp4',
  width: 400,
  height: 225,
  borderRadius: 8,
})

root.add(accordion)
root.add(video)
root.add(alertDialogTrigger)

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
