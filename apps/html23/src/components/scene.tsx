import { setCodeBasedOnParsedHtml, useEditorStore, useParsedHtmlStore } from '@/state.js'
import { Controllers, Grabbable, Hands, XRCanvas } from '@coconut-xr/natuerlich/defaults'
import { NonImmersiveCamera, SessionModeGuard, useIsInSessionMode } from '@coconut-xr/natuerlich/react'
import {
  PreviewParsedHtml,
  canvasInputProps,
  Root,
  Fullscreen,
  CustomHook,
  ConversionHtmlNode,
  ComponentInternals,
} from '@react-three/uikit'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, TiltShift2, Bloom, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { Defaults, DialogAnchor, colors } from '@react-three/uikit-default'
import { componentMap } from '@/App.js'
import { Suspense } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { useDraggingMaterialStore } from './popover/materials.js'

export function Scene() {
  return (
    <XRCanvas className="flex-grow" {...canvasInputProps}>
      <Suspense>
        <Background />
      </Suspense>
      <Effects />
      <Suspense>
        <Hands type="grab" />
      </Suspense>
      <Controllers type="grab" />
      <SessionModeGuard allow={['immersive-ar', 'immersive-vr']}>
        <group position={[0, 1.5, -0.5]}>
          <Suspense>
            <Grabbable>
              <Content />
            </Grabbable>
          </Suspense>
        </group>
      </SessionModeGuard>
      <SessionModeGuard allow={['none']}>
        <Suspense>
          <Content />
        </Suspense>
      </SessionModeGuard>
      <NonImmersiveCamera position={[0, 0, 1.2]} />
      <directionalLight position={[1, 10, 10]} intensity={1} />
      <directionalLight position={[-10, 10, 5]} intensity={1} />
    </XRCanvas>
  )
}

const immersiveModes = ['immersive-ar', 'immersive-vr'] as const

let currentHovered: { ref: ComponentInternals; element: ConversionHtmlNode } | undefined
function update(newHovered: { ref: ComponentInternals; element: ConversionHtmlNode } | undefined) {
  const material = useDraggingMaterialStore.getState()
  if (material == null) {
    return
  }
  currentHovered?.ref.setStyle(undefined)
  newHovered?.ref.setStyle(material.style)
  currentHovered = newHovered
}

export function applyMaterialToLastHovered() {
  const material = useDraggingMaterialStore.getState()
  if (material == null || currentHovered == null) {
    return
  }
  let className = currentHovered.element.attributes.className ?? ''
  for (const removeClassName of material.removeClassNames) {
    className = className.replaceAll(removeClassName, '')
  }
  className += ' ' + material.applyClassNames.join(' ')
  currentHovered.element.setAttribute('className', className)
  setCodeBasedOnParsedHtml()
  currentHovered = undefined
}

const useEditMaterial: CustomHook = (element, ref, properties) => {
  if (!(element instanceof ConversionHtmlNode)) {
    return properties
  }
  return {
    ...properties,
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      const material = useDraggingMaterialStore.getState()
      if (
        material == null ||
        ref.current == null ||
        (element.rawTagName != 'img' &&
          element.rawTagName != 'video' &&
          element.rawTagName != 'avatar' &&
          ref.current.getComputedProperty('backgroundColor') == null)
      ) {
        return
      }
      e.stopPropagation?.()
      update({ ref: ref.current, element })
    },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => {
      if (currentHovered?.ref != ref.current) {
        return
      }
      update(undefined)
    },
  }
}

function Content() {
  const view = useEditorStore((state) => state.view)
  const parsed = useParsedHtmlStore((state) => state.parsed)
  if (parsed == null) {
    return
  }
  if (view === 'hud') {
    return (
      <Fullscreen attachCamera={false}>
        <Defaults>
          <DialogAnchor>
            <PreviewParsedHtml
              customHook={useEditMaterial}
              classes={parsed.classes}
              element={parsed.element}
              componentMap={componentMap}
              colorMap={customColorsForConversion as any}
            />
          </DialogAnchor>
        </Defaults>
      </Fullscreen>
    )
  }
  return (
    <>
      <OrbitControls maxDistance={5} minDistance={0.2} maxAzimuthAngle={Math.PI / 2} minAzimuthAngle={-Math.PI / 2} />
      <Root flexDirection="column" pixelSize={0.001}>
        <Defaults>
          <DialogAnchor>
            <PreviewParsedHtml
              customHook={useEditMaterial}
              classes={parsed.classes}
              element={parsed.element}
              componentMap={componentMap}
              colorMap={customColorsForConversion as any}
            />
          </DialogAnchor>
        </Defaults>
      </Root>
    </>
  )
}

function Effects() {
  const isInXR = useIsInSessionMode(immersiveModes)
  const aberration = useEditorStore((state) => state.chromaticAberrationEffect)
  const tiltshift = useEditorStore((state) => state.tiltShiftEffect)
  const bloom = useEditorStore((state) => state.bloomEffect)
  const vignette = useEditorStore((state) => state.vignetteEffect)
  if (isInXR) {
    return null
  }
  return (
    <EffectComposer>
      {aberration ? (
        <ChromaticAberration modulationOffset={0} offset={new Vector2(0.002, 0.002)} radialModulation={false} />
      ) : (
        <></>
      )}
      {tiltshift ? <TiltShift2 blur={0.5} /> : <></>}
      {bloom ? <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> : <></>}
      {vignette ? <Vignette eskil={false} offset={0} darkness={1.1} /> : <></>}
    </EffectComposer>
  )
}

function Background() {
  const background = useEditorStore((state) => state.environment)
  const isInAR = useIsInSessionMode('immersive-ar')
  if (typeof background === 'string') {
    return <Environment background={!isInAR} preset={background as any} />
  }
  return (
    <>
      <Environment preset="apartment" />
      <color attach="background" args={[background]} />
    </>
  )
}

const customColorsForConversion = {
  background: colors.background,
  foreground: colors.foreground,
  card: colors.card,
  cardForeground: colors.cardForeground,
  popover: colors.popover,
  popoverForeground: colors.popoverForeground,
  primary: colors.primary,
  primaryForeground: colors.primaryForeground,
  secondary: colors.secondary,
  secondaryForeground: colors.secondaryForeground,
  muted: colors.muted,
  mutedForeground: colors.mutedForeground,
  accent: colors.accent,
  accentForeground: colors.accentForeground,
  destructive: colors.destructive,
  destructiveForeground: colors.destructiveForeground,
  border: colors.border,
  input: colors.input,
  ring: colors.ring,
}
