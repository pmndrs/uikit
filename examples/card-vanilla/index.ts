import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Image, Fullscreen, initNodeMaterials, initGlyphNodeMaterials } from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'

// Colors matching the default kit's light theme
const colors = {
  background: 0xffffff,
  foreground: 0x09090b,
  card: 0xffffff,
  cardForeground: 0x09090b,
  primary: 0x18181b,
  primaryForeground: 0xfafafa,
  secondary: 0xf4f4f5,
  secondaryForeground: 0x18181b,
  muted: 0xf4f4f5,
  mutedForeground: 0x71717a,
  border: 0xe4e4e7,
  destructive: 0xef4444,
}

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
scene.add(camera)

const { update } = forwardHtmlEvents(canvas, camera, scene)

const renderer = await createRenderer(canvas)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

// --- Root ---
const root = new Fullscreen(renderer, {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})
camera.add(root)

// --- Outer card wrapper ---
const cardWrapper = new Container({
  flexDirection: 'column',
  width: 440,
})
root.add(cardWrapper)

// --- Main card (clickable header) ---
let cardOpen = false

const mainCard = new Container({
  backgroundColor: colors.card,
  borderRadius: 20,
  flexDirection: 'column',
  cursor: 'pointer',
  zIndex: 10,
  onClick: () => {
    cardOpen = !cardOpen
    // Toggle notification panel visibility
    notificationPanel.setProperties({
      height: cardOpen ? 380 : 0,
    })
  },
})
cardWrapper.add(mainCard)

// Header image area (solid color placeholder for the portal scene)
const headerImage = new Container({
  width: '100%',
  height: 280,
  backgroundColor: 0x6366f1,
  borderTopRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 8,
})
mainCard.add(headerImage)

const headerTitle = new Text({
  text: 'VanArsdel',
  fontSize: 32,
  color: 'white',
  fontWeight: 'bold',
})
headerImage.add(headerTitle)

const headerSubtitle = new Text({
  text: 'Marketing Dashboard',
  fontSize: 16,
  color: 0xc7d2fe,
})
headerImage.add(headerSubtitle)

// Card info bar
const infoBar = new Container({
  backgroundColor: colors.card,
  flexDirection: 'row',
  padding: 28,
  paddingTop: 32,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomRadius: 20,
})
mainCard.add(infoBar)

const infoLeft = new Container({ flexDirection: 'column', gap: 8 })
infoBar.add(infoLeft)

const infoTitle = new Text({
  text: 'VanArsdel Marketing',
  fontSize: 24,
  color: colors.foreground,
  fontWeight: 'normal',
})
infoLeft.add(infoTitle)

const infoSubtitle = new Text({
  text: '1 activity for you',
  fontSize: 20,
  color: colors.primary,
  fontWeight: 'medium',
})
infoLeft.add(infoSubtitle)

// Avatar row
const avatarRow = new Container({ flexDirection: 'row' })
infoBar.add(avatarRow)

const avatarColors = [0x3b82f6, 0x8b5cf6, 0xec4899]
for (let i = 0; i < 3; i++) {
  const avatar = new Container({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: avatarColors[i],
    marginLeft: i > 0 ? -6 : 0,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  })
  avatarRow.add(avatar)

  const avatarInitial = new Text({
    text: ['S', 'T', 'P'][i]!,
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  })
  avatar.add(avatarInitial)
}

// --- Notification panel (slides open/closed via height) ---
const notificationPanel = new Container({
  width: '100%',
  height: 0,
  overflow: 'hidden',
  flexDirection: 'column',
  marginTop: -20,
})
cardWrapper.add(notificationPanel)

const notificationInner = new Container({
  paddingTop: 40,
  backgroundColor: colors.secondary,
  borderRadius: 20,
  flexDirection: 'column',
  width: '100%',
})
notificationPanel.add(notificationInner)

// Card header
const notifHeader = new Container({
  flexDirection: 'column',
  padding: 24,
  paddingBottom: 0,
  gap: 6,
})
notificationInner.add(notifHeader)

const notifTitle = new Text({
  text: 'Notifications',
  fontSize: 18,
  color: colors.foreground,
  fontWeight: 'bold',
})
notifHeader.add(notifTitle)

const notifDesc = new Text({
  text: 'You have 3 unread messages.',
  fontSize: 14,
  color: colors.mutedForeground,
})
notifHeader.add(notifDesc)

// Card content
const notifContent = new Container({
  flexDirection: 'column',
  padding: 24,
  gap: 16,
})
notificationInner.add(notifContent)

// Push notifications row
const pushRow = new Container({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
})
notifContent.add(pushRow)

// Bell icon placeholder
const bellIcon = new Container({
  width: 24,
  height: 24,
  borderRadius: 4,
  backgroundColor: colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
})
pushRow.add(bellIcon)

const bellText = new Text({ text: '!', fontSize: 14, color: colors.primaryForeground })
bellIcon.add(bellText)

const pushTextCol = new Container({ flexDirection: 'column', gap: 4 })
pushRow.add(pushTextCol)

const pushTitle = new Text({
  text: 'Push Notifications',
  fontSize: 14,
  color: colors.foreground,
})
pushTextCol.add(pushTitle)

const pushDesc = new Text({
  text: 'Send notifications to device.',
  fontSize: 14,
  color: colors.mutedForeground,
})
pushTextCol.add(pushDesc)

// Spacer
const pushSpacer = new Container({ flexGrow: 1 })
pushRow.add(pushSpacer)

// Toggle switch
let switchOn = false
const switchTrack = new Container({
  width: 44,
  height: 24,
  borderRadius: 12,
  backgroundColor: 0xd4d4d8,
  cursor: 'pointer',
  justifyContent: 'center',
  alignItems: 'center',
  onClick: (e) => {
    e.stopPropagation?.()
    switchOn = !switchOn
    switchTrack.setProperties({ backgroundColor: switchOn ? colors.primary : 0xd4d4d8 })
    switchThumb.setProperties({
      marginLeft: switchOn ? 22 : 2,
    })
  },
})
pushRow.add(switchTrack)

const switchThumb = new Container({
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: 0xffffff,
  marginLeft: 2,
  alignSelf: 'center',
  positionType: 'relative',
  positionLeft: 0,
})
switchTrack.add(switchThumb)

// Notification items
const notifications = [
  { title: 'Your call has been confirmed.', time: '1 hour ago' },
  { title: 'You have a new message!', time: '1 hour ago' },
  { title: 'Your subscription is expiring soon!', time: '2 hours ago' },
]

const notifList = new Container({ flexDirection: 'column' })
notifContent.add(notifList)

for (let i = 0; i < notifications.length; i++) {
  const notif = notifications[i]!
  const row = new Container({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 17,
    marginBottom: i < notifications.length - 1 ? 16 : 0,
    paddingBottom: i < notifications.length - 1 ? 16 : 0,
  })
  notifList.add(row)

  // Dot indicator
  const dot = new Container({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  })
  row.add(dot)

  const textCol = new Container({ flexDirection: 'column', gap: 4 })
  row.add(textCol)

  const itemTitle = new Text({
    text: notif.title,
    fontSize: 14,
    color: colors.foreground,
  })
  textCol.add(itemTitle)

  const itemTime = new Text({
    text: notif.time,
    fontSize: 14,
    color: colors.mutedForeground,
  })
  textCol.add(itemTime)
}

// Footer with button
const footer = new Container({
  padding: 24,
  paddingTop: 0,
})
notificationInner.add(footer)

const markAllButton = new Container({
  width: '100%',
  height: 40,
  backgroundColor: colors.primary,
  hover: { backgroundColor: 0x27272a },
  active: { backgroundColor: 0x3f3f46 },
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexDirection: 'row',
  gap: 8,
  onClick: (e) => {
    e.stopPropagation?.()
    // Mark all as read - hide dot indicators
    notifDesc.setProperties({ text: 'All caught up!' })
  },
})
footer.add(markAllButton)

// Check icon placeholder
const checkIcon = new Container({
  width: 16,
  height: 16,
  borderRadius: 3,
  borderWidth: 2,
  borderColor: colors.primaryForeground,
})
markAllButton.add(checkIcon)

const markAllText = new Text({
  text: 'Mark all as read',
  fontSize: 14,
  color: colors.primaryForeground,
})
markAllButton.add(markAllText)

// --- Resize handler ---
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
