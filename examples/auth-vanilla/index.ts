import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { reversePainterSortStable, Container, Text, Svg, Fullscreen, setPreferredColorScheme, initNodeMaterials, initGlyphNodeMaterials } from '@ni2khanna/uikit'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import { Button, Input, colors, defaultProperties } from '@ni2khanna/uikit-default'

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
  backgroundColor: colors.background,
})
camera.add(root)

// Page layout
const page = new Container({
  width: '100%',
  height: '100%',
  positionType: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
})
root.add(page)

// Login button (top right)
const loginBtn = new Button({ positionType: 'absolute', positionRight: 32, positionTop: 32 }, undefined, { variant: 'ghost' })
root.add(loginBtn)
const loginText = new Text({ text: 'Login' })
loginBtn.add(loginText)

// Left panel (dark)
const leftPanel = new Container({
  positionType: 'relative',
  flexGrow: 1,
  flexBasis: 0,
  height: '100%',
  flexDirection: 'column',
  padding: 40,
  backgroundColor: 0x18181b,
  '*': { color: 'white' },
})
page.add(leftPanel)

// Logo
const logoRow = new Container({ flexDirection: 'row', alignItems: 'center' })
leftPanel.add(logoRow)

const logoSvg = new Svg({
  width: 24,
  height: 24,
  content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>`,
})
logoRow.add(logoSvg)

const logoText = new Text({ text: ' Acme Inc', fontSize: 20, fontWeight: 'bold' })
logoRow.add(logoText)

// Spacer + quote
const spacer = new Container({ flexGrow: 1 })
leftPanel.add(spacer)

const quoteText = new Text({
  text: '"This library has saved me countless hours of work and helped me deliver stunning 3D UIs faster than ever."',
  fontSize: 18,
  lineHeight: '150%',
})
leftPanel.add(quoteText)

const quoteAuthor = new Text({ text: 'Sofia Davis', fontSize: 14, marginTop: 8 })
leftPanel.add(quoteAuthor)

// Right panel (form)
const rightPanel = new Container({
  flexGrow: 1,
  flexBasis: 0,
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 40,
})
page.add(rightPanel)

const formWrapper = new Container({
  flexDirection: 'column',
  width: 350,
  gap: 24,
})
rightPanel.add(formWrapper)

// Title
const title = new Text({
  text: 'Create an account',
  fontSize: 24,
  fontWeight: 'bold',
  color: colors.foreground,
  textAlign: 'center',
})
formWrapper.add(title)

const subtitle = new Text({
  text: 'Enter your email below to create your account',
  fontSize: 14,
  color: colors.mutedForeground,
  textAlign: 'center',
})
formWrapper.add(subtitle)

// Form fields
const formFields = new Container({ flexDirection: 'column', gap: 8 })
formWrapper.add(formFields)

const emailInput = new Input({ placeholder: 'name@example.com', autocomplete: 'email' })
formFields.add(emailInput)

const passwordInput = new Input({ placeholder: 'password', type: 'password', autocomplete: 'current-password' })
formFields.add(passwordInput)

const signInBtn = new Button({ width: '100%' })
formFields.add(signInBtn)
const signInText = new Text({ text: 'Sign In with Email' })
signInBtn.add(signInText)

// Divider
const dividerRow = new Container({ positionType: 'relative', flexDirection: 'column' })
formWrapper.add(dividerRow)

const dividerLine = new Container({
  positionType: 'absolute',
  inset: 0,
  alignItems: 'center',
  flexDirection: 'row',
})
dividerRow.add(dividerLine)

const line = new Container({ width: '100%', borderTopWidth: 1 })
dividerLine.add(line)

const dividerTextWrapper = new Container({
  positionType: 'relative',
  flexDirection: 'row',
  justifyContent: 'center',
})
dividerRow.add(dividerTextWrapper)

const dividerText = new Text({
  text: 'OR CONTINUE WITH',
  backgroundColor: colors.background,
  zIndex: 1,
  paddingX: 8,
  color: colors.mutedForeground,
  fontSize: 14,
  lineHeight: '143%',
})
dividerTextWrapper.add(dividerText)

// GitHub button
const githubBtn = new Button({ width: '100%', flexDirection: 'row' }, undefined, { variant: 'outline' })
formWrapper.add(githubBtn)

const githubSvg = new Svg({
  marginRight: 8,
  width: 16,
  height: 16,
  content: `<svg viewBox="0 0 98 96" width="98" height="96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/></svg>`,
})
githubBtn.add(githubSvg)
const githubText = new Text({ text: 'GitHub' })
githubBtn.add(githubText)

// Terms
const terms = new Text({
  text: 'By clicking continue, you agree to our Terms of Service and Privacy Policy.',
  fontSize: 12,
  color: colors.mutedForeground,
  textAlign: 'center',
})
formWrapper.add(terms)

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
