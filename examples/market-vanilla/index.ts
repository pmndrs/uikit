import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
  reversePainterSortStable,
  Container,
  Text,
  Image,
  Svg,
  Fullscreen,
  setPreferredColorScheme,
  getPreferredColorScheme,
  initNodeMaterials,
  initGlyphNodeMaterials,
} from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import {
  Button,
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
  Separator,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  colors,
  defaultProperties,
} from '@ni2khanna/uikit-default'
import {
  CirclePlusIcon,
  PackageIcon,
  EclipseIcon,
  ImageIcon,
  StarIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  SunMoonIcon,
} from '@ni2khanna/uikit-lucide'

// Data
interface Album {
  name: string
  artist: string
  cover: string
}

const listenNowAlbums: Album[] = [
  { name: 'React Rendezvous', artist: 'Ethan Byte', cover: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=300&dpr=2&q=80' },
  { name: 'Async Awakenings', artist: 'Nina Netcode', cover: 'https://images.unsplash.com/photo-1468817814611-b7edf94b7d60?w=300&dpr=2&q=80' },
  { name: 'The Art of Reusability', artist: 'Lena Logic', cover: 'https://images.unsplash.com/photo-1528143358888-6d3c7f67bd5d?w=300&dpr=2&q=80' },
  { name: 'Stateful Symphony', artist: 'Beth Binary', cover: 'https://images.unsplash.com/photo-1490300472339-79e4adc6be4a?w=300&dpr=2&q=80' },
]

const madeForYouAlbums: Album[] = [
  { name: 'Thinking Components', artist: 'Lena Logic', cover: 'https://images.unsplash.com/photo-1615247001958-f4bc92fa6a4a?w=300&dpr=2&q=80' },
  { name: 'Functional Fury', artist: 'Beth Binary', cover: 'https://images.unsplash.com/photo-1513745405825-efaf9a49315f?w=300&dpr=2&q=80' },
  { name: 'React Rendezvous', artist: 'Ethan Byte', cover: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=300&dpr=2&q=80' },
  { name: 'Stateful Symphony', artist: 'Beth Binary', cover: 'https://images.unsplash.com/photo-1446185250204-f94591f7d702?w=300&dpr=2&q=80' },
]

const playlists = [
  'Recently Added', 'Recently Played', 'Top Songs', 'Top Albums',
  'Top Artists', 'Logic Discography', 'Bedtime Beats', 'Feeling Happy',
  'I miss Y2K Pop', 'Runtober', 'Mellow Days', 'Eminem Essentials',
]

setPreferredColorScheme('light')

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

// Root
const root = new Fullscreen(renderer, {
  ...defaultProperties,
  flexDirection: 'column',
})
camera.add(root)

// --- Menu bar ---
const menubar = new Menubar({ borderRadius: 0, paddingX: 16 })
root.add(menubar)

const logoMenu = new MenubarMenu()
menubar.add(logoMenu)
const logoTrigger = new MenubarTrigger()
logoMenu.add(logoTrigger)
const logoSvg = new Svg({
  width: 70,
  content: '<svg xmlns="http://www.w3.org/2000/svg" width="70" height="50" fill="none" viewBox="0 0 194 50"><path fill="black" d="M17.5 35h15v15h-15V35zm0-17.5h15v15h-15v-15zM0 17.5h15v15H0v-15z"></path><path fill="black" d="M35 0H17.5v15H35v17.5h15V0H35zM77.51 12.546V38h4.425V20.475h.236l7.035 17.45h3.306l7.035-17.413h.236V38h4.425V12.546h-5.643L91.01 30.99h-.299l-7.557-18.444h-5.642zm37.014 25.84c2.996 0 4.785-1.405 5.606-3.009h.149V38h4.325V25.223c0-5.046-4.114-6.563-7.756-6.563-4.014 0-7.097 1.79-8.091 5.27l4.201.597c.448-1.305 1.715-2.424 3.915-2.424 2.088 0 3.232 1.07 3.232 2.946v.075c0 1.292-1.355 1.354-4.723 1.715-3.704.398-7.246 1.504-7.246 5.804 0 3.754 2.746 5.742 6.388 5.742zm1.168-3.307c-1.876 0-3.219-.857-3.219-2.51 0-1.728 1.504-2.449 3.518-2.735 1.181-.161 3.542-.46 4.126-.932v2.25c0 2.125-1.715 3.927-4.425 3.927zM129.128 38h4.499V26.777c0-2.424 1.828-4.14 4.301-4.14.758 0 1.703.137 2.088.262v-4.14a10.817 10.817 0 00-1.616-.123c-2.187 0-4.014 1.243-4.71 3.455h-.199v-3.182h-4.363V38zm13.877 0h4.499v-6.413l1.641-1.753L154.987 38h5.381l-7.83-10.85 7.395-8.24h-5.257l-6.861 7.668h-.311V12.546h-4.499V38zm27.592.373c4.45 0 7.508-2.175 8.303-5.494l-4.201-.472c-.609 1.616-2.1 2.46-4.039 2.46-2.909 0-4.835-1.913-4.873-5.182h13.299v-1.38c0-6.699-4.027-9.645-8.725-9.645-5.468 0-9.036 4.015-9.036 9.906 0 5.991 3.518 9.807 9.272 9.807zm-4.797-11.72c.137-2.437 1.939-4.487 4.623-4.487 2.586 0 4.326 1.889 4.351 4.486H165.8zm26.626-7.744h-3.766v-4.574h-4.499v4.574h-2.71v3.48h2.71v10.615c-.025 3.592 2.585 5.356 5.966 5.257 1.28-.037 2.162-.286 2.647-.447l-.758-3.518a5.616 5.616 0 01-1.318.174c-1.131 0-2.038-.398-2.038-2.212v-9.869h3.766v-3.48z"></path></svg>',
})
logoTrigger.add(logoSvg)

for (const label of ['File', 'Edit', 'View', 'Account']) {
  const menu = new MenubarMenu()
  menubar.add(menu)
  const trigger = new MenubarTrigger()
  menu.add(trigger)
  const text = new Text({ text: label })
  trigger.add(text)
}

const menuSpacer = new Container({ flexGrow: 1 })
menubar.add(menuSpacer)

// Theme toggle
const themeMenu = new MenubarMenu()
menubar.add(themeMenu)
const themeTrigger = new MenubarTrigger({
  onClick: () => {
    const pcs = getPreferredColorScheme()
    setPreferredColorScheme(pcs === 'light' ? 'dark' : pcs === 'dark' ? 'system' : 'light')
  },
})
themeMenu.add(themeTrigger)
const sunIcon = new SunIcon({ width: 16, height: 16 })
themeTrigger.add(sunIcon)

// --- Main body ---
const body = new Container({
  flexBasis: 0,
  flexGrow: 1,
  borderTopWidth: 1,
  backgroundColor: colors.background,
  flexDirection: 'row',
})
root.add(body)

// --- Sidebar ---
const sidebar = new Container({
  flexDirection: 'column',
  overflow: 'scroll',
  paddingRight: 20,
  paddingBottom: 48,
  marginTop: 16,
})
body.add(sidebar)

function addSidebarSection(title: string, items: Array<{ label: string; icon: any; variant?: string }>) {
  const section = new Container({ flexDirection: 'column', paddingX: 12, paddingY: 8 })
  sidebar.add(section)

  const heading = new Text({
    text: title,
    marginBottom: 8,
    paddingX: 16,
    fontWeight: 'semi-bold',
    fontSize: 18,
    lineHeight: '28px',
    letterSpacing: -0.4,
  })
  section.add(heading)

  const btnList = new Container({ flexDirection: 'column', gap: 4 })
  section.add(btnList)

  for (const item of items) {
    const btn = new Button({ justifyContent: 'flex-start' }, undefined, { variant: (item.variant ?? 'ghost') as any })
    btnList.add(btn)
    const icon = new item.icon({ marginRight: 8, width: 16, height: 16 })
    btn.add(icon)
    const text = new Text({ text: item.label })
    btn.add(text)
  }
}

addSidebarSection('Discover', [
  { label: 'Models', icon: PackageIcon, variant: 'secondary' },
  { label: 'Materials', icon: EclipseIcon },
  { label: 'HDRIS', icon: ImageIcon },
])

addSidebarSection('Collections', [
  { label: 'Favorites', icon: StarIcon },
  { label: 'Models', icon: PackageIcon },
  { label: 'Materials', icon: EclipseIcon },
  { label: 'HDRIs', icon: ImageIcon },
  { label: 'Creators', icon: UserIcon },
])

// Favorites / playlists
const favSection = new Container({ flexDirection: 'column', paddingY: 8 })
sidebar.add(favSection)

const favHeading = new Text({
  text: 'Favorites',
  paddingX: 28,
  fontSize: 18,
  lineHeight: '28px',
  fontWeight: 'semi-bold',
  letterSpacing: -0.4,
})
favSection.add(favHeading)

const favList = new Container({ paddingX: 4, flexDirection: 'column', gap: 4, padding: 8 })
favSection.add(favList)

for (const playlist of playlists) {
  const btn = new Button({ justifyContent: 'flex-start' }, undefined, { variant: 'ghost' })
  favList.add(btn)
  const icon = new StarIcon({ marginRight: 8, width: 16, height: 16 })
  btn.add(icon)
  const text = new Text({ text: playlist, fontWeight: 'normal' })
  btn.add(text)
}

// Vertical separator
const sep = new Separator({ orientation: 'vertical' })
body.add(sep)

// --- Content area ---
const content = new Container({
  marginTop: 16,
  overflow: 'scroll',
  flexGrow: 1,
  flexBasis: 0,
  paddingX: 32,
  paddingBottom: 24,
  paddingTop: 8,
  flexDirection: 'column',
})
body.add(content)

// Tabs
const tabs = new Tabs({ defaultValue: 'music', height: '100%', gap: 24 })
content.add(tabs)

// Tab header row
const tabHeader = new Container({ flexShrink: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' })
tabs.add(tabHeader)

const tabsList = new TabsList()
tabHeader.add(tabsList)

const musicTrigger = new TabsTrigger({ value: 'music' })
tabsList.add(musicTrigger)
musicTrigger.add(new Text({ text: 'Models' }))

const podcastTrigger = new TabsTrigger({ value: 'podcasts', disabled: true })
tabsList.add(podcastTrigger)
podcastTrigger.add(new Text({ text: 'HDRIS' }))

const liveTrigger = new TabsTrigger({ value: 'live', disabled: true })
tabsList.add(liveTrigger)
liveTrigger.add(new Text({ text: 'Materials' }))

const requestBtn = new Button({ marginRight: 16 })
tabHeader.add(requestBtn)
const plusIcon = new CirclePlusIcon({ marginRight: 8, height: 16, width: 16 })
requestBtn.add(plusIcon)
requestBtn.add(new Text({ text: 'Request Model' }))

// Tab content: music
const musicContent = new TabsContent({ value: 'music', flexShrink: 0, flexDirection: 'column', borderWidth: 0, padding: 0 })
tabs.add(musicContent)

// Trending section
const trendingHeader = new Container({ flexDirection: 'column', gap: 4 })
musicContent.add(trendingHeader)
trendingHeader.add(new Text({ fontWeight: 'semi-bold', letterSpacing: -0.4, fontSize: 18, lineHeight: '28px', text: 'Trending' }))
trendingHeader.add(new Text({ color: colors.mutedForeground, fontSize: 14, lineHeight: '20px', text: 'Top picks for you. Updated daily.' }))

musicContent.add(new Separator({ marginY: 16 }))

// Album row (trending)
const trendingRow = new Container({ flexDirection: 'row', overflow: 'scroll', gap: 16, paddingBottom: 16 })
musicContent.add(trendingRow)

function createAlbumArtwork(album: Album, width: number, height: number) {
  const card = new Container({ flexShrink: 0, flexDirection: 'column', gap: 12 })

  const img = new Image({ borderRadius: 6, src: album.cover, width, height, objectFit: 'cover' })
  card.add(img)

  const info = new Container({ flexDirection: 'column', gap: 4 })
  card.add(info)
  info.add(new Text({ fontWeight: 'medium', fontSize: 14, lineHeight: '100%', text: album.name }))
  info.add(new Text({ fontSize: 12, lineHeight: '16px', color: colors.mutedForeground, text: album.artist }))

  return card
}

for (const album of listenNowAlbums) {
  trendingRow.add(createAlbumArtwork(album, 250, 330))
}

// Made By You section
const madeByYouHeader = new Container({ flexDirection: 'column', marginTop: 24, gap: 4 })
musicContent.add(madeByYouHeader)
madeByYouHeader.add(new Text({ fontWeight: 'semi-bold', letterSpacing: -0.4, fontSize: 18, lineHeight: '28px', text: 'Made By You' }))
madeByYouHeader.add(new Text({ color: colors.mutedForeground, fontSize: 14, lineHeight: '20px', text: 'Your personal models.' }))

musicContent.add(new Separator({ marginY: 16 }))

const madeByYouRow = new Container({ flexShrink: 1, flexDirection: 'row', overflow: 'scroll', gap: 16, paddingBottom: 16 })
musicContent.add(madeByYouRow)

for (const album of madeForYouAlbums) {
  madeByYouRow.add(createAlbumArtwork(album, 150, 150))
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
