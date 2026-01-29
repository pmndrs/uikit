import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
  reversePainterSortStable,
  Container,
  Text,
  Image,
  Fullscreen,
  setPreferredColorScheme,
  initNodeMaterials,
  initGlyphNodeMaterials,
} from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  colors,
  defaultProperties,
} from '@ni2khanna/uikit-default'
import {
  ActivityIcon,
  CreditCardIcon,
  DollarSignIcon,
  UsersIcon,
  CalendarIcon,
  ChevronDownIcon,
} from '@ni2khanna/uikit-lucide'

setPreferredColorScheme('light')

// --- Data ---

const chartData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
]

const recentSales = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00' },
  { name: 'William Kim', email: 'will@email.com', amount: '+$99.00' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00' },
]

const statsCards = [
  { title: 'Total Revenue', value: '$45,231.89', change: '+20.1% from last month', Icon: DollarSignIcon },
  { title: 'Subscriptions', value: '+2350', change: '+180.1% from last month', Icon: UsersIcon },
  { title: 'Sales', value: '+12,234', change: '+19% from last month', Icon: CreditCardIcon },
  { title: 'Active Now', value: '+573', change: '+201 since last hour', Icon: ActivityIcon },
]

// --- Renderer ---

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
})
camera.add(root)

// --- Scrollable wrapper ---
const scrollWrapper = new Container({
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'scroll',
})
root.add(scrollWrapper)

// === Header bar ===
const header = new Container({
  flexShrink: 0,
  flexDirection: 'column',
  borderBottomWidth: 1,
})
scrollWrapper.add(header)

const headerRow = new Container({
  height: 64,
  alignItems: 'center',
  flexDirection: 'row',
  paddingX: 16,
})
header.add(headerRow)

// Team switcher button
const teamSwitcher = new Button({ width: 200, justifyContent: 'space-between' }, undefined, { variant: 'outline' })
headerRow.add(teamSwitcher)
teamSwitcher.add(new Text({ text: 'Alicia Koch' }))
teamSwitcher.add(new ChevronDownIcon({ marginLeft: 'auto', height: 20, width: 20, flexShrink: 0, opacity: 0.5 }))

// Main nav
const mainNav = new Container({ alignItems: 'center', flexDirection: 'row', gap: 16, marginX: 24 })
headerRow.add(mainNav)

const navItems = ['Overview', 'Customers', 'Products', 'Settings']
for (let i = 0; i < navItems.length; i++) {
  mainNav.add(new Text({
    text: navItems[i],
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 'medium',
    color: i === 0 ? undefined : colors.mutedForeground,
  }))
}

// Right side of header
const headerRight = new Container({ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 16 })
headerRow.add(headerRight)

const sourceBtn = new Button({}, undefined, { variant: 'secondary', size: 'sm' })
headerRight.add(sourceBtn)
sourceBtn.add(new Text({ text: 'Source Code' }))

// Avatar placeholder (circle)
const avatarCircle = new Container({
  width: 32,
  height: 32,
  borderRadius: 1000,
  backgroundColor: colors.muted,
  cursor: 'pointer',
})
headerRight.add(avatarCircle)

// === Main content area ===
const mainContent = new Container({
  flexDirection: 'column',
  flexGrow: 1,
  gap: 16,
  padding: 32,
  paddingTop: 24,
})
scrollWrapper.add(mainContent)

// Title row
const titleRow = new Container({ flexShrink: 0, flexDirection: 'row', justifyContent: 'space-between', gap: 8 })
mainContent.add(titleRow)

titleRow.add(new Text({ fontSize: 30, lineHeight: '100%', text: 'Dashboard' }))

const titleActions = new Container({ flexDirection: 'row', gap: 8, alignItems: 'center' })
titleRow.add(titleActions)

// Date range picker button
const dateBtn = new Button({ width: 260, justifyContent: 'flex-start' }, undefined, { variant: 'outline' })
titleActions.add(dateBtn)
dateBtn.add(new CalendarIcon({ marginRight: 8, width: 16, height: 16 }))
dateBtn.add(new Text({ fontWeight: 'normal', text: 'Jan 20, 2023 - Feb 09, 2023' }))

const downloadBtn = new Button({})
titleActions.add(downloadBtn)
downloadBtn.add(new Text({ text: 'Download' }))

// === Tabs ===
const tabs = new Tabs({ flexDirection: 'column', defaultValue: 'overview', gap: 16 })
mainContent.add(tabs)

const tabsList = new TabsList({ alignSelf: 'flex-start' })
tabs.add(tabsList)

for (const tab of [
  { value: 'overview', label: 'Overview' },
  { value: 'analytics', label: 'Analytics', disabled: true },
  { value: 'reports', label: 'Reports', disabled: true },
  { value: 'notifications', label: 'Notifications', disabled: true },
]) {
  const trigger = new TabsTrigger({ value: tab.value, disabled: tab.disabled })
  tabsList.add(trigger)
  trigger.add(new Text({ text: tab.label }))
}

// === Tab content: overview ===
const overviewContent = new TabsContent({
  flexShrink: 0,
  flexDirection: 'column',
  value: 'overview',
  gap: 16,
  borderWidth: 0,
  padding: 0,
})
tabs.add(overviewContent)

// --- Stats cards row ---
const statsRow = new Container({ flexShrink: 0, flexDirection: 'row', gap: 16 })
overviewContent.add(statsRow)

for (const stat of statsCards) {
  const card = new Card({ flexDirection: 'column', flexBasis: 0, flexGrow: 1 })
  statsRow.add(card)

  const cardHeader = new CardHeader({
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    gap: 0,
  })
  card.add(cardHeader)

  const cardTitle = new CardTitle({})
  cardHeader.add(cardTitle)
  cardTitle.add(new Text({ fontSize: 14, lineHeight: '20px', text: stat.title }))

  cardHeader.add(new stat.Icon({ width: 16, height: 16, color: colors.mutedForeground }))

  const cardContent = new CardContent({ flexShrink: 0, flexDirection: 'column' })
  card.add(cardContent)
  cardContent.add(new Text({ fontSize: 24, lineHeight: '32px', text: stat.value }))
  cardContent.add(new Text({ fontSize: 12, lineHeight: '16px', color: colors.mutedForeground, text: stat.change }))
}

// --- Bottom row: Overview chart + Recent Sales ---
const bottomRow = new Container({ flexShrink: 0, flexDirection: 'row', gap: 16 })
overviewContent.add(bottomRow)

// Overview chart card
const chartCard = new Card({ flexDirection: 'column', flexGrow: 4, flexBasis: 0 })
bottomRow.add(chartCard)

const chartCardHeader = new CardHeader({})
chartCard.add(chartCardHeader)
const chartCardTitle = new CardTitle({})
chartCardHeader.add(chartCardTitle)
chartCardTitle.add(new Text({ text: 'Overview' }))

const chartCardContent = new CardContent({ flexShrink: 0, paddingLeft: 8 })
chartCard.add(chartCardContent)

// Bar chart
const chartMax = 6000
const yAxisLabels = ['$6000', '$4500', '$3000', '$1500', '$0']

const chartContainer = new Container({
  flexShrink: 0,
  paddingX: 16,
  gap: 16,
  width: '100%',
  height: 350,
  flexDirection: 'row',
})
chartCardContent.add(chartContainer)

// Y-axis labels
const yAxis = new Container({
  paddingBottom: 12 * 1.333 + 8,
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
})
chartContainer.add(yAxis)

for (const label of yAxisLabels) {
  yAxis.add(new Text({ color: colors.mutedForeground, fontSize: 12, lineHeight: '16px', text: label }))
}

// Bars
const barsContainer = new Container({ gap: 16, height: '100%', flexGrow: 1, flexDirection: 'row' })
chartContainer.add(barsContainer)

for (const { name, total } of chartData) {
  const col = new Container({ flexDirection: 'column', gap: 8, flexGrow: 1, alignItems: 'center' })
  barsContainer.add(col)

  const barOuter = new Container({
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    width: '100%',
  })
  col.add(barOuter)

  barOuter.add(new Container({
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    height: `${Math.min(1, total / chartMax) * 100}%`,
    backgroundColor: colors.primary,
    width: '100%',
  }))

  col.add(new Text({ color: colors.mutedForeground, fontSize: 12, lineHeight: '16px', text: name }))
}

// Recent sales card
const salesCard = new Card({ flexDirection: 'column', flexGrow: 3, flexBasis: 0 })
bottomRow.add(salesCard)

const salesCardHeader = new CardHeader({})
salesCard.add(salesCardHeader)
const salesCardTitle = new CardTitle({})
salesCardHeader.add(salesCardTitle)
salesCardTitle.add(new Text({ text: 'Recent Sales' }))
const salesCardDesc = new CardDescription({})
salesCardHeader.add(salesCardDesc)
salesCardDesc.add(new Text({ text: 'You made 265 sales this month.' }))

const salesCardContent = new CardContent({ flexDirection: 'column' })
salesCard.add(salesCardContent)

const salesList = new Container({ flexDirection: 'column', gap: 32 })
salesCardContent.add(salesList)

for (const sale of recentSales) {
  const row = new Container({ flexDirection: 'row', alignItems: 'center' })
  salesList.add(row)

  // Avatar placeholder
  row.add(new Container({
    width: 36,
    height: 36,
    borderRadius: 1000,
    backgroundColor: colors.muted,
  }))

  const info = new Container({ flexDirection: 'column', marginLeft: 16, gap: 4 })
  row.add(info)
  info.add(new Text({ fontSize: 14, lineHeight: '100%', fontWeight: 'medium', text: sale.name }))
  info.add(new Text({ fontSize: 14, lineHeight: '20px', color: colors.mutedForeground, text: sale.email }))

  row.add(new Text({ marginLeft: 'auto', fontWeight: 'medium', text: sale.amount }))
}

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
