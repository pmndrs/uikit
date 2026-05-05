import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { reversePainterSortStable, BaseOutProperties, Container, Fullscreen, InProperties, Text } from '@pmndrs/uikit'
import { PlusIcon } from '@pmndrs/uikit-lucide'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { OrbitHandles } from '@pmndrs/handle'
import {
  Badge,
  Button,
  ButtonIcon,
  ButtonLabel,
  Checkbox,
  Panel,
  ProgressBar,
  Toggle,
} from '@pmndrs/uikit-horizon'

type PerfSample = {
  frameMs: number
  eventsMs: number
  orbitMs: number
  motionMs: number
  layoutMs: number
  uiMs: number
  renderMs: number
  totalJsMs: number
}

type PerfReport = {
  config: StressConfig
  frames: number
  avgFps: number
  p95FrameMs: number
  droppedFrames: number
  longFrames: number
  avgEventsMs: number
  p95EventsMs: number
  avgUiMs: number
  p95UiMs: number
  avgMotionMs: number
  p95MotionMs: number
  avgLayoutMs: number
  p95LayoutMs: number
  avgRenderMs: number
  p95RenderMs: number
  avgTotalJsMs: number
  p95TotalJsMs: number
  components: number
  renderCalls: number
  triangles: number
}

type StartupReport = {
  moduleStartMs: number
  configMs?: number
  rendererReadyMs?: number
  sceneReadyMs?: number
  uiBuiltMs?: number
  loopScheduledMs?: number
  firstFrameStartMs?: number
  firstEventsMs?: number
  firstOrbitMs?: number
  firstMotionMs?: number
  firstLayoutMs?: number
  firstRenderMs?: number
  firstFrameTotalMs?: number
  firstRenderEndMs?: number
}

type StartupFrameDetail = {
  index: number
  timings: Record<string, number>
  calls: Record<string, number>
  beforeGroups: Record<string, number>
  afterGroups: Record<string, number>
}

type StressConfig = {
  rows: number
  cards: number
  tags: number
  motion: boolean
  boxes: number
  animatedBars: number
}

const startup: StartupReport = {
  moduleStartMs: performance.now(),
}

function startupMark(name: keyof StartupReport, value = performance.now() - startup.moduleStartMs) {
  startup[name] = value
}

declare global {
  interface Window {
    __uikitPerf?: {
      config: StressConfig
      samples: Array<PerfSample>
      report: () => PerfReport
      reset: () => void
      waitForSamples: (count: number) => Promise<PerfReport>
      renderer: WebGLRenderer
      scene: Scene
      camera: PerspectiveCamera
      fullscreen: Fullscreen
      startup: StartupReport
      startupFrameDetails: Array<StartupFrameDetail>
      manualFrame: (time?: number) => void
    }
  }
}

const params = new URLSearchParams(window.location.search)
const config: StressConfig = {
  rows: readIntegerParam('rows', 160),
  cards: readIntegerParam('cards', 8),
  tags: readIntegerParam('tags', 3),
  motion: params.get('motion') !== '0',
  boxes: readIntegerParam('boxes', 32),
  animatedBars: readIntegerParam('animatedBars', -1),
}
startupMark('configMs')

const camera = new PerspectiveCamera(55, 1, 0.01, 100)
camera.position.set(0, 1.4, 5)

const scene = new Scene()
scene.background = new Color(0xf6f8fb)
scene.add(new AmbientLight(undefined, 1.5))
scene.add(camera)

const canvas = document.getElementById('root') as HTMLCanvasElement
const renderer = new WebGLRenderer({ antialias: true, canvas })
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)
startupMark('rendererReadyMs')

const { update } = forwardHtmlEvents(canvas, camera, scene)
const orbit = new OrbitHandles(canvas, camera)
orbit.bind(scene)

const directionalLight = new DirectionalLight(0xffffff, 2)
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const pointLight = new PointLight(0xffffff, 12, 12)
pointLight.position.set(-4, 3, 3)
scene.add(pointLight)
scene.add(createBackdrop(config.boxes))
startupMark('sceneReadyMs')

const fullscreen = new Fullscreen(renderer, {
  distanceToCamera: 3.2,
  flexDirection: 'row',
  gap: 18,
  padding: 24,
  backgroundColor: 0xf7f9fc,
  color: 0x101828,
  fontSize: 13,
})
camera.add(fullscreen)

let componentCount = 1
const animatedBars: Array<ProgressBar> = []

const shell = ui(
  Panel,
  {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    padding: 14,
    gap: 14,
    backgroundColor: 0xffffff,
    borderColor: 0xd8dee8,
    borderWidth: 1,
    borderRadius: 8,
  },
  fullscreen,
)

buildSidebar(shell)
buildWorkspace(shell)
startupMark('uiBuiltMs')

const samples: Array<PerfSample> = []
const startupFrameDetails: Array<StartupFrameDetail> = []
window.__uikitPerf = {
  config,
  samples,
  report,
  reset: () => {
    samples.length = 0
  },
  waitForSamples: async (count: number) => {
    while (samples.length < count) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    return report()
  },
  renderer,
  scene,
  camera,
  fullscreen,
  startup,
  startupFrameDetails,
  manualFrame: (time = performance.now()) => animation(time),
}

if (params.get('noLoop') !== '1') {
  renderer.setAnimationLoop(animation)
}
startupMark('loopScheduledMs')
updateSize()
window.addEventListener('resize', updateSize)

let prev: number | undefined
let recordedFirstFrame = false
let frameIndex = 0
function animation(time: number) {
  frameIndex += 1
  const firstFrameStart = performance.now()
  if (!recordedFirstFrame) {
    startupMark('firstFrameStartMs', firstFrameStart - startup.moduleStartMs)
  }
  const frameMs = prev == null ? 16.67 : time - prev
  prev = time

  const eventsStart = performance.now()
  update()
  const eventsEnd = performance.now()

  orbit.update(frameMs)
  const orbitEnd = performance.now()

  if (config.motion) {
    animateBars(time)
  }
  const motionEnd = performance.now()

  const detailProbe = params.get('startupDetail') === '1' && frameIndex <= 8 ? createStartupFrameProbe(frameIndex) : undefined
  fullscreen.update(frameMs)
  const uiEnd = performance.now()
  detailProbe?.finish()

  renderer.render(scene, camera)
  const renderEnd = performance.now()

  if (!recordedFirstFrame) {
    recordedFirstFrame = true
    startup.firstEventsMs = eventsEnd - eventsStart
    startup.firstOrbitMs = orbitEnd - eventsEnd
    startup.firstMotionMs = motionEnd - orbitEnd
    startup.firstLayoutMs = uiEnd - motionEnd
    startup.firstRenderMs = renderEnd - uiEnd
    startup.firstFrameTotalMs = renderEnd - firstFrameStart
    startup.firstRenderEndMs = renderEnd - startup.moduleStartMs
  }

  samples.push({
    frameMs,
    eventsMs: eventsEnd - eventsStart,
    orbitMs: orbitEnd - eventsEnd,
    motionMs: motionEnd - orbitEnd,
    layoutMs: uiEnd - motionEnd,
    uiMs: uiEnd - orbitEnd,
    renderMs: renderEnd - uiEnd,
    totalJsMs: renderEnd - eventsStart,
  })

  if (samples.length > 900) {
    samples.shift()
  }
}

function createStartupFrameProbe(index: number) {
  const timings: Record<string, number> = {}
  const calls: Record<string, number> = {}
  const restores: Array<() => void> = []
  const beforeGroups = summarizeGroups()
  const add = (name: string, ms: number) => {
    timings[name] = (timings[name] ?? 0) + ms
    calls[name] = (calls[name] ?? 0) + 1
  }
  const wrap = (object: any, methodName: string, label: string) => {
    const original = object?.[methodName]
    if (typeof original !== 'function') {
      return
    }
    object[methodName] = function (...args: Array<unknown>) {
      const start = performance.now()
      try {
        return original.apply(this, args)
      } finally {
        add(label, performance.now() - start)
      }
    }
    restores.push(() => {
      object[methodName] = original
    })
  }

  wrap(fullscreen.node, 'calculateLayout', 'layout.calculateLayout')
  for (const group of collectGroups((fullscreen.root.value as any).panelGroupManager)) {
    wrap(group, 'onFrame', 'panel.onFrame')
    wrap(group, 'resize', 'panel.resize')
  }
  for (const group of collectGroups((fullscreen.root.value as any).glyphGroupManager)) {
    wrap(group, 'onFrame', 'glyph.onFrame')
    wrap(group, 'resize', 'glyph.resize')
  }

  return {
    finish: () => {
      for (const restore of restores) {
        restore()
      }
      startupFrameDetails.push({ index, timings, calls, beforeGroups, afterGroups: summarizeGroups() })
    },
  }
}

function collectGroups(manager: any) {
  const groups: Array<any> = []
  const map = manager?.map
  if (!(map instanceof Map)) {
    return groups
  }
  for (const inner of map.values()) {
    if (!(inner instanceof Map)) {
      continue
    }
    for (const group of inner.values()) {
      groups.push(group)
    }
  }
  return groups
}

function summarizeGroups(): Record<string, number> {
  const root = fullscreen.root.value as any
  const panelGroups = collectGroups(root.panelGroupManager)
  const glyphGroups = collectGroups(root.glyphGroupManager)
  const sum = (groups: Array<any>, key: string) => groups.reduce((total, group) => total + (Number(group[key]) || 0), 0)
  return {
    panelGroups: panelGroups.length,
    panelElements: sum(panelGroups, 'elementCount'),
    panelBuffer: sum(panelGroups, 'bufferElementSize'),
    panelMeshCount: panelGroups.reduce((total, group) => total + (Number(group.mesh?.count) || 0), 0),
    glyphGroups: glyphGroups.length,
    glyphMeshCount: glyphGroups.reduce((total, group) => total + (Number(group.mesh?.count) || 0), 0),
    glyphAttrCount: glyphGroups.reduce((total, group) => total + (Number(group.instanceMatrix?.count) || 0), 0),
  }
}

function buildSidebar(parent: Container) {
  const sidebar = ui(
    Container,
    {
      width: 236,
      height: '100%',
      flexShrink: 0,
      flexDirection: 'column',
      gap: 16,
      padding: 18,
      backgroundColor: 0x111827,
      color: 0xffffff,
      borderRadius: 8,
    },
    parent,
  )
  addText(sidebar, 'UIKit Ops', { fontSize: 22, fontWeight: 700, lineHeight: '110%' })
  addText(sidebar, 'Vanilla Three.js stress surface', { color: 0xa7b0c0, fontSize: 12 })

  const tiers = [
    ['Light', 80],
    ['Normal', 160],
    ['Busy', 480],
    ['Heavy', 1200],
    ['Extreme', 2400],
  ] as const

  const nav = ui(Container, { flexDirection: 'column', gap: 8 }, sidebar)
  for (const [label, rows] of tiers) {
    nav.add(makeButton(label, rows === config.rows ? 'positive' : 'onMedia', () => loadRows(rows)))
  }

  const meters = ui(Container, { flexDirection: 'column', gap: 8, marginTop: 'auto' }, sidebar)
  addText(meters, `Rows ${config.rows}`, { color: 0xd1d5db, fontSize: 12 })
  addText(meters, `Cards ${config.cards}`, { color: 0xd1d5db, fontSize: 12 })
  addText(meters, `Animated ${config.motion ? 'yes' : 'no'}`, { color: 0xd1d5db, fontSize: 12 })
  meters.add(makeButton(config.motion ? 'Pause motion' : 'Start motion', 'tertiary', () => loadRows(config.rows, !config.motion)))
}

function buildWorkspace(parent: Container) {
  const workspace = ui(
    Container,
    {
      height: '100%',
      flexGrow: 1,
      flexShrink: 1,
      flexDirection: 'column',
      gap: 12,
    },
    parent,
  )

  const header = ui(Container, { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }, workspace)
  const headline = ui(Container, { flexDirection: 'column', gap: 2, flexGrow: 1 }, header)
  addText(headline, 'Operations Console', { fontSize: 21, fontWeight: 700, lineHeight: '110%' })
  addText(headline, 'Synthetic but dashboard-shaped: cards, controls, rows, tags, and progress.', {
    color: 0x667085,
    fontSize: 12,
  })
  header.add(makeButton('Open issue', 'primary', () => console.log('open issue')))
  header.add(makeButton('Export', 'secondary', () => console.log('export')))

  const cards = ui(Container, { height: 102, flexShrink: 0, flexDirection: 'row', flexWrap: 'no-wrap', gap: 10 }, workspace)
  for (let i = 0; i < config.cards; i++) {
    cards.add(makeMetricCard(i))
  }

  const table = ui(
    Container,
    {
      flexGrow: 1,
      flexShrink: 1,
      minHeight: 0,
      flexDirection: 'column',
      overflow: 'scroll',
      scrollbarWidth: 8,
      scrollbarColor: 0x98a2b3,
      scrollbarBorderRadius: 8,
      gap: 6,
      padding: 8,
      backgroundColor: 0xeef2f6,
      borderRadius: 8,
    },
    workspace,
  )

  for (let i = 0; i < config.rows; i++) {
    table.add(makeRow(i))
  }
}

function makeMetricCard(index: number) {
  const card = ui(Container, {
    width: 112,
    height: 98,
    flexDirection: 'column',
    gap: 10,
    padding: 14,
    backgroundColor: [0xffffff, 0xf0f9ff, 0xfef7ed, 0xf0fdf4][index % 4],
    borderColor: 0xd8dee8,
    borderWidth: 1,
    borderRadius: 8,
  })
  addText(card, ['Latency', 'Throughput', 'Backlog', 'Health'][index % 4], { color: 0x475467, fontSize: 12 })
  addText(card, `${Math.round(38 + ((index * 17) % 61))}${index % 2 === 0 ? 'ms' : '%'}`, {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '100%',
  })
  const bar = new ProgressBar({ width: '100%', value: 25 + ((index * 11) % 70) })
  componentCount += 2
  animatedBars.push(bar)
  card.add(bar)
  return card
}

function makeRow(index: number) {
  const row = ui(Container, {
    height: 58,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingX: 12,
    backgroundColor: index % 2 === 0 ? 0xffffff : 0xf9fafb,
    borderColor: 0xe4e7ec,
    borderWidth: 1,
    borderRadius: 7,
    hover: { backgroundColor: 0xecfeff, borderColor: 0x06b6d4 },
  })

  row.add(new Checkbox({ variant: index % 3 === 0 ? 'onMedia' : 'normal' }))
  componentCount += 1

  ui(
    Container,
    {
      width: 10,
      height: 10,
      borderRadius: 10,
      backgroundColor: [0x12b76a, 0xf79009, 0xf04438, 0x06b6d4][index % 4],
      flexShrink: 0,
    },
    row,
  )

  const title = ui(Container, { width: 250, flexShrink: 0, flexDirection: 'column', gap: 2 }, row)
  addText(title, `Cluster ${String(index + 1).padStart(4, '0')}`, { fontWeight: 700, fontSize: 13, lineHeight: '100%' })
  addText(title, ['API gateway', 'Billing worker', 'Media service', 'Search shard'][index % 4], {
    color: 0x667085,
    fontSize: 11,
  })

  const tagWrap = ui(Container, { width: 260, flexShrink: 0, flexDirection: 'row', gap: 6 }, row)
  for (let i = 0; i < config.tags; i++) {
    tagWrap.add(new Badge({ variant: ['secondary', 'positive', 'negative'][i % 3] as any, label: `p${(index + i) % 9}` }))
    componentCount += 2
  }

  const progressColumn = ui(Container, { flexGrow: 1, minWidth: 120, flexDirection: 'column', gap: 4 }, row)
  const bar = new ProgressBar({ width: '100%', value: (index * 13) % 100 })
  componentCount += 2
  animatedBars.push(bar)
  progressColumn.add(bar)
  addText(progressColumn, `${40 + (index % 49)} jobs/min`, { color: 0x667085, fontSize: 10 })

  row.add(new Toggle({ defaultChecked: index % 5 === 0 }))
  componentCount += 1
  row.add(makeIconButton())
  return row
}

function makeIconButton() {
  const button = new Button({ icon: true, size: 'sm', variant: 'tertiary' })
  const icon = new ButtonIcon()
  icon.add(new PlusIcon())
  button.add(icon)
  componentCount += 3
  return button
}

function makeButton(
  labelText: string,
  variant: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'onMedia',
  onClick: () => void,
) {
  const button = new Button({ size: 'sm', variant, onClick })
  const label = new ButtonLabel({ flexDirection: 'row' })
  label.add(new Text({ text: labelText }))
  button.add(label)
  componentCount += 3
  return button
}

function addText(parent: Container, text: string, properties?: InProperties<BaseOutProperties>) {
  const element = new Text({ text, ...properties })
  componentCount += 1
  parent.add(element)
  return element
}

function ui<T extends Container>(
  ComponentClass: new (properties?: InProperties<any>) => T,
  properties: InProperties<any>,
  parent?: Container,
) {
  const element = new ComponentClass(properties)
  componentCount += 1
  parent?.add(element)
  return element
}

function createBackdrop(count: number) {
  const group = new Group()
  const geometry = new BoxGeometry(0.28, 0.28, 0.28)
  const materials = [
    new MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.55, metalness: 0.1 }),
    new MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55, metalness: 0.1 }),
    new MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55, metalness: 0.1 }),
  ]
  for (let i = 0; i < count; i++) {
    const mesh = new Mesh(geometry, materials[i % materials.length])
    mesh.position.set((i % 8) - 3.5, -1.8 + Math.floor(i / 8) * 0.34, -2.5 - (i % 4) * 0.18)
    mesh.rotation.set(i * 0.12, i * 0.07, 0)
    group.add(mesh)
  }
  return group
}

function animateBars(time: number) {
  const count = config.animatedBars < 0 ? animatedBars.length : Math.min(config.animatedBars, animatedBars.length)
  for (let i = 0; i < count; i++) {
    animatedBars[i].setProperties({ value: (20 + i * 7 + time * 0.018) % 100 })
  }
}

function loadRows(rows: number, motion = config.motion) {
  const next = new URLSearchParams(window.location.search)
  next.set('rows', String(rows))
  next.set('cards', String(config.cards))
  next.set('tags', String(config.tags))
  next.set('boxes', String(config.boxes))
  next.set('animatedBars', String(config.animatedBars))
  next.set('motion', motion ? '1' : '0')
  window.location.search = next.toString()
}

function readIntegerParam(name: string, fallback: number) {
  const raw = params.get(name)
  if (raw == null) {
    return fallback
  }
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) ? Math.max(0, value) : fallback
}

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

function report(): PerfReport {
  const data = samples.slice(10)
  const frames = data.length
  const frameAvg = avg(data.map((sample) => sample.frameMs))
  return {
    config,
    frames,
    avgFps: frameAvg === 0 ? 0 : 1000 / frameAvg,
    p95FrameMs: percentile(data.map((sample) => sample.frameMs), 0.95),
    droppedFrames: data.filter((sample) => sample.frameMs > 40).length,
    longFrames: data.filter((sample) => sample.frameMs > 50).length,
    avgEventsMs: avg(data.map((sample) => sample.eventsMs)),
    p95EventsMs: percentile(data.map((sample) => sample.eventsMs), 0.95),
    avgUiMs: avg(data.map((sample) => sample.uiMs)),
    p95UiMs: percentile(data.map((sample) => sample.uiMs), 0.95),
    avgMotionMs: avg(data.map((sample) => sample.motionMs)),
    p95MotionMs: percentile(data.map((sample) => sample.motionMs), 0.95),
    avgLayoutMs: avg(data.map((sample) => sample.layoutMs)),
    p95LayoutMs: percentile(data.map((sample) => sample.layoutMs), 0.95),
    avgRenderMs: avg(data.map((sample) => sample.renderMs)),
    p95RenderMs: percentile(data.map((sample) => sample.renderMs), 0.95),
    avgTotalJsMs: avg(data.map((sample) => sample.totalJsMs)),
    p95TotalJsMs: percentile(data.map((sample) => sample.totalJsMs), 0.95),
    components: componentCount,
    renderCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
  }
}

function avg(values: Array<number>) {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function percentile(values: Array<number>, amount: number) {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * amount))]
}
