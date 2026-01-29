import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
  reversePainterSortStable,
  Container,
  Text,
  Fullscreen,
  getPreferredColorScheme,
  setPreferredColorScheme,
  initNodeMaterials,
  initGlyphNodeMaterials,
} from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionTriggerIcon,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  colors,
  defaultProperties,
} from '@ni2khanna/uikit-default'
import {
  BellRingIcon,
  BoldIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  ItalicIcon,
  MoonIcon,
  SunIcon,
  SunMoonIcon,
  TerminalIcon,
  UnderlineIcon,
} from '@ni2khanna/uikit-lucide'
import { signal } from '@preact/signals-core'

setPreferredColorScheme('light')

// --- Renderer setup ---

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
scene.add(camera)

const { update } = forwardHtmlEvents(canvas, camera, scene)

const renderer = await createRenderer(canvas)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

// --- Root ---
const root = new Fullscreen(renderer, {
  ...defaultProperties,
  flexDirection: 'column',
  backgroundColor: colors.background,
  alignItems: 'center',
  padding: 32,
})
camera.add(root)

// --- Component demo builders ---

function buildAccordionDemo(): Container {
  const wrapper = new Container({ flexDirection: 'column', width: 300 })
  const accordion = new Accordion({})
  wrapper.add(accordion)

  const items = [
    { value: 'item-1', q: 'Is it accessible?', a: 'Yes. It adheres to the WAI-ARIA design pattern.' },
    { value: 'item-2', q: 'Is it styled?', a: "Yes. It comes with default styles that matches the other components' aesthetic." },
    { value: 'item-3', q: 'Is it animated?', a: "Yes. It's animated by default, but you can disable it if you prefer." },
  ]
  for (const item of items) {
    const accordionItem = new AccordionItem({ value: item.value })
    accordion.add(accordionItem)
    const trigger = new AccordionTrigger({})
    accordionItem.add(trigger)
    trigger.add(new Text({ text: item.q }))
    trigger.add(new AccordionTriggerIcon({}))
    const content = new AccordionContent({})
    accordionItem.add(content)
    content.add(new Text({ text: item.a }))
  }
  return wrapper
}

function buildAlertDemo(): Alert {
  const alert = new Alert({ maxWidth: 500 })
  const icon = new AlertIcon({})
  alert.add(icon)
  icon.add(new TerminalIcon({ width: 16, height: 16 }))
  const title = new AlertTitle({})
  alert.add(title)
  title.add(new Text({ text: 'Error' }))
  const desc = new AlertDescription({})
  alert.add(desc)
  desc.add(new Text({ text: 'You can add components to your app using the cli.' }))
  return alert
}

function buildAlertDialogDemo(): Container {
  const wrapper = new Container({ flexDirection: 'column', alignItems: 'center' })
  const dialogRef = signal<InstanceType<typeof AlertDialog> | undefined>(undefined)

  const triggerBtn = new AlertDialogTrigger({ dialog: dialogRef })
  wrapper.add(triggerBtn)
  const outlineBtn = new Button({}, undefined, { variant: 'outline' })
  triggerBtn.add(outlineBtn)
  outlineBtn.add(new Text({ text: 'Show Dialog' }))

  const dialog = new AlertDialog({})
  dialogRef.value = dialog
  wrapper.add(dialog)

  const dialogContent = new AlertDialogContent({})
  dialog.add(dialogContent)

  const header = new AlertDialogHeader({})
  dialogContent.add(header)
  const dialogTitle = new AlertDialogTitle({})
  header.add(dialogTitle)
  dialogTitle.add(new Text({ text: 'Are you absolutely sure?' }))
  const dialogDesc = new AlertDialogDescription({})
  header.add(dialogDesc)
  dialogDesc.add(new Text({ text: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.' }))

  const footer = new AlertDialogFooter({})
  dialogContent.add(footer)
  const cancelBtn = new AlertDialogCancel({})
  footer.add(cancelBtn)
  cancelBtn.add(new Text({ text: 'Cancel' }))
  const actionBtn = new AlertDialogAction({})
  footer.add(actionBtn)
  actionBtn.add(new Text({ text: 'Continue' }))

  return wrapper
}

function buildAvatarDemo(): Container {
  const wrapper = new Container({ alignItems: 'center' })
  wrapper.add(new Avatar({ src: 'https://picsum.photos/100/100' }))
  return wrapper
}

function buildBadgeDemo(): Badge {
  const badge = new Badge({})
  badge.add(new Text({ text: 'Badge' }))
  return badge
}

function buildButtonDemo(): Button {
  const btn = new Button({}, undefined, { variant: 'outline', size: 'icon' })
  btn.add(new ChevronRightIcon({ width: 16, height: 16 }))
  return btn
}

function buildCardDemo(): Card {
  const card = new Card({ width: 380 })

  const header = new CardHeader({})
  card.add(header)
  const title = new CardTitle({})
  header.add(title)
  title.add(new Text({ text: 'Notifications' }))
  const desc = new CardDescription({})
  header.add(desc)
  desc.add(new Text({ text: 'You have 3 unread messages.' }))

  const content = new CardContent({ flexDirection: 'column', gap: 16 })
  card.add(content)

  // Push notifications row
  const pushRow = new Container({ flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 6, borderWidth: 1, padding: 16 })
  content.add(pushRow)
  pushRow.add(new BellRingIcon({}))
  const pushInfo = new Container({ flexDirection: 'column', gap: 4 })
  pushRow.add(pushInfo)
  pushInfo.add(new Text({ fontSize: 14, lineHeight: '100%', text: 'Push Notifications' }))
  pushInfo.add(new Text({ fontSize: 14, lineHeight: '20px', color: colors.mutedForeground, text: 'Send notifications to device.' }))
  pushRow.add(new Switch({}))

  // Notification list
  const notifList = new Container({ flexDirection: 'column' })
  content.add(notifList)

  const notifications = [
    { title: 'Your call has been confirmed.', description: '1 hour ago' },
    { title: 'You have a new message!', description: '1 hour ago' },
    { title: 'Your subscription is expiring soon!', description: '2 hours ago' },
  ]
  for (let i = 0; i < notifications.length; i++) {
    const n = notifications[i]
    const row = new Container({
      marginBottom: i === notifications.length - 1 ? 0 : 16,
      paddingBottom: i === notifications.length - 1 ? 0 : 16,
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 17,
    })
    notifList.add(row)
    row.add(new Container({ height: 8, width: 8, transformTranslateY: 4, borderRadius: 1000, backgroundColor: 0x0ea5e9 }))
    const info = new Container({ flexDirection: 'column', gap: 4 })
    row.add(info)
    info.add(new Text({ fontSize: 14, lineHeight: '100%', text: n.title }))
    info.add(new Text({ fontSize: 14, lineHeight: '20px', color: colors.mutedForeground, text: n.description }))
  }

  const footer = new CardFooter({})
  card.add(footer)
  const markBtn = new Button({ flexDirection: 'row', width: '100%' })
  footer.add(markBtn)
  markBtn.add(new CheckIcon({ marginRight: 8, height: 16, width: 16 }))
  markBtn.add(new Text({ text: 'Mark all as read' }))

  return card
}

function buildCheckboxDemo(): Container {
  const wrapper = new Container({ flexDirection: 'row', gap: 8, alignItems: 'center' })
  wrapper.add(new Checkbox({}))
  const label = new Label({})
  wrapper.add(label)
  label.add(new Text({ text: 'Accept terms and conditions' }))
  return wrapper
}

function buildDialogDemo(): Container {
  const wrapper = new Container({ flexDirection: 'column', alignItems: 'center' })
  const dialogRef = signal<InstanceType<typeof Dialog> | undefined>(undefined)

  const triggerBtn = new DialogTrigger({ dialog: dialogRef })
  wrapper.add(triggerBtn)
  const outlineBtn = new Button({}, undefined, { variant: 'outline' })
  triggerBtn.add(outlineBtn)
  outlineBtn.add(new Text({ text: 'Edit Profile' }))

  const dialog = new Dialog({})
  dialogRef.value = dialog
  wrapper.add(dialog)

  const dialogContent = new DialogContent({ sm: { maxWidth: 425 } })
  dialog.add(dialogContent)

  const header = new DialogHeader({})
  dialogContent.add(header)
  const dialogTitle = new DialogTitle({})
  header.add(dialogTitle)
  dialogTitle.add(new Text({ text: 'Edit profile' }))
  const dialogDesc = new DialogDescription({})
  header.add(dialogDesc)
  dialogDesc.add(new Text({ text: "Make changes to your profile here. Click save when you're done." }))

  const body = new Container({ flexDirection: 'column', alignItems: 'center', gap: 16, paddingY: 16 })
  dialogContent.add(body)

  for (const labelText of ['Name', 'Username']) {
    const row = new Container({ alignItems: 'center', gap: 16 })
    body.add(row)
    const label = new Label({})
    row.add(label)
    label.add(new Text({ textAlign: 'right', text: labelText }))
  }

  const footer = new DialogFooter({})
  dialogContent.add(footer)
  const saveBtn = new Button({})
  footer.add(saveBtn)
  saveBtn.add(new Text({ text: 'Save changes' }))

  return wrapper
}

function buildInputDemo(): Input {
  return new Input({ width: 200, placeholder: 'Email' })
}

function buildPaginationDemo(): Pagination {
  const pagination = new Pagination({})
  const paginationContent = new PaginationContent({})
  pagination.add(paginationContent)

  const prevItem = new PaginationItem({})
  paginationContent.add(prevItem)
  prevItem.add(new PaginationPrevious({}))

  for (const page of [1, 2, 3]) {
    const item = new PaginationItem({})
    paginationContent.add(item)
    const link = new PaginationLink({ isActive: page === 2 })
    item.add(link)
    link.add(new Text({ text: String(page) }))
  }

  const ellipsisItem = new PaginationItem({})
  paginationContent.add(ellipsisItem)
  ellipsisItem.add(new PaginationEllipsis({}))

  const nextItem = new PaginationItem({})
  paginationContent.add(nextItem)
  nextItem.add(new PaginationNext({}))

  return pagination
}

function buildProgressDemo(): Progress {
  const progress = new Progress({ value: 13, width: 200 })
  setTimeout(() => progress.setProperties({ value: 66 }), 1000)
  return progress
}

function buildRadioGroupDemo(): RadioGroup {
  const group = new RadioGroup({ defaultValue: 'comfortable' })
  for (const value of ['default', 'comfortable', 'compact']) {
    const item = new RadioGroupItem({ value })
    group.add(item)
    const label = new Label({})
    item.add(label)
    label.add(new Text({ text: value.charAt(0).toUpperCase() + value.slice(1) }))
  }
  return group
}

function buildSeparatorDemo(): Container {
  const wrapper = new Container({ width: 300, flexDirection: 'column' })

  const textBlock = new Container({ flexDirection: 'column', gap: 4 })
  wrapper.add(textBlock)
  textBlock.add(new Text({ fontSize: 14, lineHeight: '100%', text: 'Radix Primitives' }))
  textBlock.add(new Text({ fontSize: 14, lineHeight: '20px', color: colors.mutedForeground, text: 'An open-source UI component library.' }))

  wrapper.add(new Separator({ marginY: 16 }))

  const linkRow = new Container({ flexDirection: 'row', height: 20, alignItems: 'center', gap: 16 })
  wrapper.add(linkRow)
  linkRow.add(new Text({ fontSize: 14, lineHeight: '20px', text: 'Blog' }))
  linkRow.add(new Separator({ orientation: 'vertical' }))
  linkRow.add(new Text({ fontSize: 14, lineHeight: '20px', text: 'Docs' }))
  linkRow.add(new Separator({ orientation: 'vertical' }))
  linkRow.add(new Text({ fontSize: 14, lineHeight: '20px', text: 'Source' }))

  return wrapper
}

function buildSkeletonDemo(): Container {
  const wrapper = new Container({ flexDirection: 'row', alignItems: 'center', gap: 16 })
  wrapper.add(new Skeleton({ borderRadius: 1000, height: 48, width: 48 }))
  const lines = new Container({ flexDirection: 'column', gap: 8 })
  wrapper.add(lines)
  lines.add(new Skeleton({ height: 16, width: 250 }))
  lines.add(new Skeleton({ height: 16, width: 200 }))
  return wrapper
}

function buildSliderDemo(): Slider {
  return new Slider({ defaultValue: 50, max: 100, step: 1, width: 300 })
}

function buildSwitchDemo(): Container {
  const wrapper = new Container({ flexDirection: 'row', alignItems: 'center', gap: 8 })
  wrapper.add(new Switch({}))
  const label = new Label({})
  wrapper.add(label)
  label.add(new Text({ text: 'Airplane Mode' }))
  return wrapper
}

function buildTabsDemo(): Tabs {
  const tabs = new Tabs({ defaultValue: 'account', width: 400 })

  const tabsList = new TabsList({ width: '100%' })
  tabs.add(tabsList)

  const accountTrigger = new TabsTrigger({ flexGrow: 1, value: 'account' })
  tabsList.add(accountTrigger)
  accountTrigger.add(new Text({ text: 'Account' }))

  const passwordTrigger = new TabsTrigger({ flexGrow: 1, value: 'password' })
  tabsList.add(passwordTrigger)
  passwordTrigger.add(new Text({ text: 'Password' }))

  // Account tab
  const accountContent = new TabsContent({ value: 'account' })
  tabs.add(accountContent)
  const accountCard = new Card({})
  accountContent.add(accountCard)

  const accountHeader = new CardHeader({})
  accountCard.add(accountHeader)
  const accountTitle = new CardTitle({})
  accountHeader.add(accountTitle)
  accountTitle.add(new Text({ text: 'Account' }))
  const accountDesc = new CardDescription({})
  accountHeader.add(accountDesc)
  accountDesc.add(new Text({ text: "Make changes to your account here. Click save when you're done." }))

  const accountBody = new CardContent({ flexDirection: 'column', gap: 8 })
  accountCard.add(accountBody)
  for (const [labelText, value] of [['Name', 'Pedro Duarte'], ['Username', '@peduarte']]) {
    const field = new Container({ flexDirection: 'column', gap: 4 })
    accountBody.add(field)
    const label = new Label({})
    field.add(label)
    label.add(new Text({ text: labelText }))
    field.add(new Text({ text: value }))
  }

  const accountFooter = new CardFooter({})
  accountCard.add(accountFooter)
  const saveAccountBtn = new Button({})
  accountFooter.add(saveAccountBtn)
  saveAccountBtn.add(new Text({ text: 'Save changes' }))

  // Password tab
  const passwordContent = new TabsContent({ value: 'password' })
  tabs.add(passwordContent)
  const passwordCard = new Card({})
  passwordContent.add(passwordCard)

  const passwordHeader = new CardHeader({})
  passwordCard.add(passwordHeader)
  const passwordTitle = new CardTitle({})
  passwordHeader.add(passwordTitle)
  passwordTitle.add(new Text({ text: 'Password' }))
  const passwordDesc = new CardDescription({})
  passwordHeader.add(passwordDesc)
  passwordDesc.add(new Text({ text: "Change your password here. After saving, you'll be logged out." }))

  const passwordBody = new CardContent({ flexDirection: 'column', gap: 8 })
  passwordCard.add(passwordBody)
  for (const labelText of ['Current password', 'New password']) {
    const field = new Container({ flexDirection: 'column', gap: 4 })
    passwordBody.add(field)
    const label = new Label({})
    field.add(label)
    label.add(new Text({ text: labelText }))
    field.add(new Text({ text: 'password' }))
  }

  const passwordFooter = new CardFooter({})
  passwordCard.add(passwordFooter)
  const savePasswordBtn = new Button({})
  passwordFooter.add(savePasswordBtn)
  savePasswordBtn.add(new Text({ text: 'Save password' }))

  return tabs
}

function buildTextareaDemo(): Textarea {
  return new Textarea({ width: 200, placeholder: 'Email' })
}

function buildToggleGroupDemo(): ToggleGroup {
  const group = new ToggleGroup({})
  const boldItem = new ToggleGroupItem({})
  group.add(boldItem)
  boldItem.add(new BoldIcon({ height: 16, width: 16 }))
  const italicItem = new ToggleGroupItem({})
  group.add(italicItem)
  italicItem.add(new ItalicIcon({ height: 16, width: 16 }))
  const underlineItem = new ToggleGroupItem({})
  group.add(underlineItem)
  underlineItem.add(new UnderlineIcon({ width: 16, height: 16 }))
  return group
}

function buildToggleDemo(): Toggle {
  const toggle = new Toggle({})
  toggle.add(new BoldIcon({ height: 16, width: 16 }))
  return toggle
}

function buildTooltipDemo(): Tooltip {
  const tooltip = new Tooltip({})
  const trigger = new TooltipTrigger({})
  tooltip.add(trigger)
  const btn = new Button({}, undefined, { variant: 'outline' })
  trigger.add(btn)
  btn.add(new Text({ text: 'Hover' }))
  const content = new TooltipContent({})
  tooltip.add(content)
  content.add(new Text({ text: 'Add to library' }))
  return tooltip
}

// --- Component pages registry ---

const componentPages: Record<string, () => Container | any> = {
  accordion: buildAccordionDemo,
  alert: buildAlertDemo,
  'alert-dialog': buildAlertDialogDemo,
  avatar: buildAvatarDemo,
  badge: buildBadgeDemo,
  button: buildButtonDemo,
  card: buildCardDemo,
  checkbox: buildCheckboxDemo,
  dialog: buildDialogDemo,
  input: buildInputDemo,
  pagination: buildPaginationDemo,
  progress: buildProgressDemo,
  'radio-group': buildRadioGroupDemo,
  separator: buildSeparatorDemo,
  skeleton: buildSkeletonDemo,
  slider: buildSliderDemo,
  switch: buildSwitchDemo,
  tabs: buildTabsDemo,
  toggle: buildToggleDemo,
  'toggle-group': buildToggleGroupDemo,
  tooltip: buildTooltipDemo,
  textarea: buildTextareaDemo,
}

// --- Build UI ---

// Determine selected component from URL
const urlParams = new URLSearchParams(window.location.search)
let selectedComponent = urlParams.get('component') ?? 'card'
if (!(selectedComponent in componentPages)) {
  selectedComponent = 'card'
}

// Tabs
const tabs = new Tabs({
  alignSelf: 'stretch',
  flexGrow: 1,
  value: selectedComponent,
  onValueChange: (value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('component', value)
    history.replaceState(null, '', '?' + params.toString())
  },
})
root.add(tabs)

// Tabs list (scrollable)
const tabsList = new TabsList({ height: 55, paddingBottom: 10, overflow: 'scroll', maxWidth: '100%' })
tabs.add(tabsList)

for (const name of Object.keys(componentPages)) {
  const trigger = new TabsTrigger({ flexShrink: 0, value: name })
  tabsList.add(trigger)
  trigger.add(new Text({ text: name.charAt(0).toUpperCase() + name.slice(1) }))
}

// Tab content panels
for (const [name, builder] of Object.entries(componentPages)) {
  const content = new TabsContent({
    flexDirection: 'column',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    value: name,
  })
  tabs.add(content)
  content.add(builder())
}

// Bottom bar: theme toggle + import display
const bottomBar = new Card({ padding: 8, flexDirection: 'row', gap: 8, alignItems: 'center' })
root.add(bottomBar)

const themeBtn = new Button({}, undefined, { variant: 'ghost', size: 'icon' })
bottomBar.add(themeBtn)

let pcs = getPreferredColorScheme()
const sunIcon = new SunIcon({})
const moonIcon = new MoonIcon({})
const sunMoonIcon = new SunMoonIcon({})

function updateThemeIcon() {
  // Remove all, add the right one
  themeBtn.remove(sunIcon)
  themeBtn.remove(moonIcon)
  themeBtn.remove(sunMoonIcon)
  if (pcs === 'dark') {
    themeBtn.add(moonIcon)
  } else if (pcs === 'system') {
    themeBtn.add(sunMoonIcon)
  } else {
    themeBtn.add(sunIcon)
  }
}
updateThemeIcon()

themeBtn.setProperties({
  onClick: () => {
    setPreferredColorScheme(pcs === 'light' ? 'dark' : pcs === 'dark' ? 'system' : 'light')
    pcs = getPreferredColorScheme()
    updateThemeIcon()
  },
})

bottomBar.add(new Separator({ orientation: 'vertical' }))

const importText = new Text({ padding: 8, text: `import { ${selectedComponent.charAt(0).toUpperCase()}${selectedComponent.slice(1)} } from "@ni2khanna/uikit-default"` })
bottomBar.add(importText)

const copyBtn = new Button({
  onClick: () => {
    navigator.clipboard.writeText(
      `import { ${selectedComponent.charAt(0).toUpperCase()}${selectedComponent.slice(1)} } from "@ni2khanna/uikit-default"`,
    )
  },
}, undefined, { variant: 'secondary', size: 'icon' })
bottomBar.add(copyBtn)
copyBtn.add(new CopyIcon({}))

// --- Resize ---
function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}
updateSize()
window.addEventListener('resize', updateSize)

// --- Animation loop ---
let prev: number | undefined
renderer.setAnimationLoop((time: number) => {
  const delta = prev == null ? 0 : time - prev
  prev = time
  update()
  root.update(delta)
  renderer.render(scene, camera)
})
