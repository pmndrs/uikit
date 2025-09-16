import { AmbientLight, Color, DirectionalLight, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, setPreferredColorScheme, Fullscreen, Text } from '@pmndrs/uikit'
import { IceCreamBowlIcon, MicIcon, PlusIcon, SearchIcon } from '@pmndrs/uikit-lucide'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { OrbitHandles } from '@pmndrs/handle'
import {
  Avatar,
  Badge,
  Button,
  ButtonIcon,
  ButtonLabel,
  ButtonLabelSubtext,
  Dropdown,
  DropdownAvatar,
  DropdownButton,
  DropdownList,
  DropdownListItem,
  DropdownTextValue,
  Input,
  InputField,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Toggle,
} from '@pmndrs/uikit-horizon'

// init

const camera = new PerspectiveCamera(70, 1, 0.01, 100)
camera.position.z = 5

const scene = new Scene()
scene.background = new Color('white')
scene.add(new AmbientLight(undefined, 2))
scene.add(camera)

const canvas = document.getElementById('root') as HTMLCanvasElement

const { update } = forwardHtmlEvents(canvas, camera, scene)
const orbit = new OrbitHandles(canvas, camera)
orbit.bind(scene)

const renderer = new WebGLRenderer({ antialias: true, canvas })
setPreferredColorScheme('dark')

//UI
const root = new Fullscreen(renderer, { alignItems: 'center', justifyContent: 'center' })
camera.add(root)
scene.add(camera)

// Add directional light
const directionalLight = new DirectionalLight(0xffffff, 1)
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

// Add point light
const pointLight = new PointLight(0xffffff, 1)
pointLight.position.set(-5, 5, -5)
scene.add(pointLight)

const dropdown = new Dropdown({ size: 'sm' })
dropdown.add(new DropdownTextValue({ placeholder: 'Select' }))
dropdown.add(new DropdownButton())
const list = new DropdownList()
const listItem1 = new DropdownListItem()
listItem1.add(new Text({ text: 'Nothing' }))
list.add(listItem1)
const listItem2 = new DropdownListItem({ value: 'Item1' })
listItem2.add(new Text({ text: 'Item1' }))
list.add(listItem2)
dropdown.add(list)
root.add(dropdown)

/*const radioGroup = new RadioGroup({ defaultValue: '1' })
const radioGroupitem1 = new RadioGroupItem({ value: '1' })
radioGroupitem1.add(new Text({ text: 'Item1' }))
const radioGroupitem2 = new RadioGroupItem({ value: '2' })
radioGroupitem2.add(new Text({ text: 'Item2' }))
const radioGroupitem3 = new RadioGroupItem({ value: '3' })
radioGroupitem3.add(new Text({ text: 'Item3' }))
radioGroup.add(radioGroupitem1, radioGroupitem2, radioGroupitem3)
root.add(radioGroup)*/

/*root.add(
  new InputField({
    leftIcon: SearchIcon,
    rightIcon: MicIcon,
    label: 'HelperText',
    width: 561,
  }),
)*/

/*root.add(
  new Input({
    width: 217,
    leftIcon: SearchIcon,
    rightIcon: MicIcon,
    size: 'lg',
    variant: 'search',
    textAlign: 'center',
  }),
)*/

//root.add(new Badge({ variant: 'secondary', label: 'Label', icon: PlusIcon }))

//root.add(new Toggle())

/*const btn = new Button()
const plusIcon: PlusIcon = new PlusIcon()
console.log(plusIcon)
const btnIcon = new ButtonIcon()
btnIcon.add(plusIcon)
btn.add(btnIcon)
const label = new ButtonLabel()
label.add(new Text({ text: 'Label' }))
const subtext = new ButtonLabelSubtext()
label.add(subtext)
subtext.add(new Text({ text: 'Subtext' }))
btn.add(label)
root.add(btn)*/

/*const stepper = new ProgressBarStepper({ width: 400 })
root.add(stepper)
stepper.add(new ProgressBarStepperStep({ value: true }))
stepper.add(new ProgressBarStepperStep({ value: false }))
stepper.add(new ProgressBarStepperStep({ value: false }))
stepper.add(new ProgressBarStepperStep({ value: false }))*/

//root.add(new ProgressBar({ width: 400, value: 0 }))

//root.add(new IconIndicator({ variant: 'poor' }))

//root.add(new Slider({ defaultValue: 0, size: 'lg', icon: IceCreamBowlIcon }))

/*root.add(
  new Avatar({ src: './avatar.png', attributionActive: true, attributionSrc: './app.png', size: 'lg', selected: true }),
)*/

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
