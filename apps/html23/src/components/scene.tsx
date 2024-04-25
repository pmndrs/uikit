import { useEditorStore } from '@/state.js'
import { Defaults, colors } from '@/theme.js'
import { XRCanvas } from '@coconut-xr/natuerlich/defaults'
import { useIsInSessionMode } from '@coconut-xr/natuerlich/react'
import { Preview, canvasInputProps, Root, Fullscreen } from '@react-three/uikit'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, TiltShift2, Bloom, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { DialogAnchor } from '@react-three/uikit-default'
import { componentMap } from '@/App.js'

export function Scene() {
  return (
    <XRCanvas className="flex-grow" camera={{ position: [0, 0, 3] }} {...canvasInputProps}>
      <Background />
      <Effects />
      <Content />
    </XRCanvas>
  )
}

const immersiveModes = ['immersive-ar', 'immersive-vr'] as const

function Content() {
  const view = useEditorStore((state) => state.view)
  const code = useEditorStore((state) => state.code)
  if (view === 'hud') {
    return (
      <Fullscreen>
        <Defaults>
          <DialogAnchor>
            <Preview componentMap={componentMap} colorMap={customColorsForConversion}>
              {code}
            </Preview>
          </DialogAnchor>
        </Defaults>
      </Fullscreen>
    )
  }
  return (
    <>
      <OrbitControls />
      <Root>
        <Defaults>
          <DialogAnchor>
            <Preview componentMap={componentMap} colorMap={customColorsForConversion}>
              {code}
            </Preview>
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
  const background = useEditorStore((state) => state.background)
  if (typeof background === 'string') {
    return <Environment background preset={background as any} blur={0.3} />
  }
  return <color attach="background" args={[background]} />
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
