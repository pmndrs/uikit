import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
  Container,
  Fullscreen,
  Svg,
  Text,
  initGlyphNodeMaterials,
  initNodeMaterials,
  reversePainterSortStable,
} from '@ni2khanna/uikit'
import { inter } from '@ni2khanna/msdfonts'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'
import syriacFontData from './assets/fonts/NotoSansSyriac-Regular.json'
import copticFontData from './assets/fonts/NotoSansCoptic-Regular.json'
import syriacAtlasUrl from './assets/fonts/noto-syriac.png?url'
import copticAtlasUrl from './assets/fonts/noto-coptic.png?url'

const fillSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <path fill="#f97316" d="M48 8 83 28v40L48 88 13 68V28z"/>
  <path fill="#fff7ed" d="M48 22 66 32v20L48 62 30 52V32z"/>
  <circle cx="48" cy="47" r="7" fill="#ea580c"/>
</svg>
`

const classSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <style>
    .primary { fill: #22c55e; }
    .accent { fill: #f59e0b; }
    .outline { fill: #f8fafc; }
  </style>
  <rect class="primary" x="14" y="18" width="68" height="60" rx="18"/>
  <path class="accent" d="M48 26 64 54H32z"/>
  <circle class="outline" cx="48" cy="60" r="8"/>
</svg>
`

const currentColorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M24 72 48 24 72 72"/>
  <path d="M34 56h28"/>
</svg>
`

function toAbsoluteAssetUrl(url: string) {
  return new URL(url, window.location.href).href
}

const syriacFont = {
  ...syriacFontData,
  pages: [toAbsoluteAssetUrl(syriacAtlasUrl)],
}

const copticFont = {
  ...copticFontData,
  pages: [toAbsoluteAssetUrl(copticAtlasUrl)],
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
scene.background = new Color(0x07111f)
scene.add(camera)

const { update } = forwardHtmlEvents(canvas, camera, scene)

const renderer = await createRenderer(canvas)
renderer.localClippingEnabled = true
renderer.setTransparentSort(reversePainterSortStable)

const root = new Fullscreen(renderer, {
  backgroundColor: 0x07111f,
  flexDirection: 'column',
  gap: 18,
  padding: 28,
  alignItems: 'stretch',
  justifyContent: 'center',
})
camera.add(root)

const headingGroup = new Container({
  flexDirection: 'column',
  gap: 6,
})
root.add(headingGroup)

headingGroup.add(
  new Text({
    text: 'SVG + Unicode Fallback',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  }),
)

headingGroup.add(
  new Text({
    text: 'Exercises fill SVGs, style/class SVGs, currentColor strokes, and multi-font unicode fallback.',
    fontSize: 14,
    color: 0x94a3b8,
  }),
)

const svgRow = new Container({
  flexDirection: 'row',
  gap: 16,
  width: '100%',
  justifyContent: 'space-between',
})
root.add(svgRow)

svgRow.add(createSvgCard('Fill-Based SVG', 'Direct fill attributes should render.', undefined, fillSvg))
svgRow.add(createSvgCard('Style/Class SVG', 'Rules from <style> should resolve.', undefined, classSvg))
svgRow.add(createSvgCard('currentColor Stroke', 'Stroke geometry should follow color.', '#38bdf8', currentColorSvg))

const textRow = new Container({
  flexDirection: 'row',
  gap: 16,
  width: '100%',
  justifyContent: 'space-between',
})
root.add(textRow)

textRow.add(
  createTextCard(
    'Inter Only',
    'Expected to show fallback misses as question marks.',
    {
      inter,
    },
    undefined,
  ),
)

textRow.add(
  createTextCard(
    'Inter + Fallbacks',
    'Syriac and Coptic glyphs come from explicit fallback families.',
    {
      inter,
      syriac: { normal: syriacFont },
      coptic: { normal: copticFont },
    },
    ['syriac', 'coptic'],
  ),
)

function createSvgCard(title: string, subtitle: string, color: string | undefined, content: string) {
  const card = new Container({
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: 0x0f1b2d,
    borderWidth: 1,
    borderColor: 0x1f3149,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    flexDirection: 'column',
    alignItems: 'stretch',
  })

  card.add(
    new Text({
      text: title,
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    }),
  )

  card.add(
    new Text({
      text: subtitle,
      fontSize: 13,
      color: 0x8ea3bd,
    }),
  )

  const svgFrame = new Container({
    height: 150,
    backgroundColor: 0x091321,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 0x20334d,
    alignItems: 'center',
    justifyContent: 'center',
  })
  card.add(svgFrame)

  svgFrame.add(
    new Svg({
      width: 96,
      height: 96,
      color,
      content,
    }),
  )

  return card
}

function createTextCard(
  title: string,
  subtitle: string,
  fontFamilies: Record<string, any>,
  fontFamilyFallbacks: Array<string> | undefined,
) {
  const card = new Container({
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: 0x0f1b2d,
    borderWidth: 1,
    borderColor: 0x1f3149,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    flexDirection: 'column',
    alignItems: 'stretch',
  })

  card.add(
    new Text({
      text: title,
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    }),
  )

  card.add(
    new Text({
      text: subtitle,
      fontSize: 13,
      color: 0x8ea3bd,
    }),
  )

  const sample = new Container({
    backgroundColor: 0x091321,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 0x20334d,
    padding: 14,
    gap: 10,
    flexDirection: 'column',
    fontFamilies,
  })
  card.add(sample)

  sample.add(
    new Text({
      text: 'Latin: Inter keeps the primary look consistent.',
      fontSize: 15,
      color: 0xdce8f4,
      fontFamily: 'inter',
    }),
  )

  sample.add(
    new Text({
      text:
        fontFamilyFallbacks == null
          ? 'Inter only sample: ܫܠܡܐ Ⲁⲩⲱ'
          : 'Mixed fallback sample: Inter ܫܠܡܐ Ⲁⲩⲱ',
      fontSize: 28,
      lineHeight: '135%',
      color: 'white',
      fontFamily: 'inter',
      fontFamilyFallbacks,
    }),
  )

  if (fontFamilyFallbacks != null) {
    sample.add(
      new Text({
        text: 'Syriac direct: ܫܠܡܐ',
        fontSize: 24,
        color: 0xf8fafc,
        fontFamily: 'syriac',
      }),
    )

    sample.add(
      new Text({
        text: 'Coptic direct: Ⲁⲩⲱ',
        fontSize: 24,
        color: 0xf8fafc,
        fontFamily: 'coptic',
      }),
    )
  }

  sample.add(
    new Text({
      text:
        fontFamilyFallbacks == null
          ? 'This card intentionally has no fallback fonts configured.'
          : 'Fallback order: inter -> syriac -> coptic. Direct script lines are included for verification.',
      fontSize: 12,
      color: 0x7f93ac,
      fontFamily: 'inter',
    }),
  )

  return card
}

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

updateSize()
window.addEventListener('resize', updateSize)

let prev: number | undefined
renderer.setAnimationLoop((time: number) => {
  const delta = prev == null ? 0 : time - prev
  prev = time

  update()
  root.update(delta)
  renderer.render(scene, camera)
})
