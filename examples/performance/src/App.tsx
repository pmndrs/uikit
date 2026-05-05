import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Container, Fullscreen, Text, VanillaContainer } from '@react-three/uikit'
import { OrbitControls } from '@react-three/drei'
import { noEvents, PointerEvents } from '@react-three/xr'
import { effect, signal } from '@preact/signals-core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color } from 'three'

type Mode = 'cards' | 'decorated' | 'sampled'

type SceneState = {
  mode: Mode
  level: number
}

type Preset = {
  label: string
  items: number
  columns: number
}

const presets: Array<Preset> = [
  { label: 'Desk', items: 192, columns: 16 },
  { label: 'Busy', items: 768, columns: 32 },
  { label: 'Ops', items: 1536, columns: 48 },
  { label: 'Wall', items: 3072, columns: 64 },
  { label: 'Dense', items: 6144, columns: 96 },
  { label: 'Stress', items: 12288, columns: 128 },
  { label: 'Melt', items: 24576, columns: 192 },
  { label: 'Flood', items: 49152, columns: 256 },
  { label: 'Crush', items: 98304, columns: 384 },
]

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'cards', label: 'Cards' },
  { id: 'decorated', label: 'Decorated' },
  { id: 'sampled', label: 'Sampled' },
]

const palette = ['#f8fafc', '#d8e2dc', '#ffd166', '#7bdff2', '#b2f7ef', '#ffafcc', '#cdb4db', '#bde0fe']
const ink = '#172033'
const muted = '#607080'

declare global {
  interface Window {
    __uikitPerf?: {
      getState: () => SceneState & Preset & { objects: number; render: Record<string, number> }
      setLevel: (level: number) => void
      setMode: (mode: Mode) => void
      setComplexity: (level: number, mode?: Mode) => void
    }
  }
}

export default function App() {
  const [state, setState] = useState<SceneState>(() => readInitialState())
  const preset = presets[state.level]!
  const setLevel = (level: number) => setState((current) => ({ ...current, level: clampLevel(level) }))
  const setMode = (mode: Mode) => setState((current) => ({ ...current, mode }))

  return (
    <Canvas
      events={noEvents}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true, antialias: false }}
      camera={{ position: [0, 0, 900], near: 0.1, far: 5000 }}
    >
      <color attach="background" args={['#eef3f7']} />
      <ambientLight intensity={0.7} />
      <directionalLight intensity={0.4} position={[5, 8, 12]} />
      <PointerEvents />
      <OrbitControls enableDamping dampingFactor={0.08} enablePan={false} minDistance={540} maxDistance={1500} />
      <PerformanceBridge state={state} setState={setState} />
      <Fullscreen flexDirection="column" gap={16} padding={28} backgroundColor="#eef3f7" {...{ '*': { fontSize: 14 } }}>
        <Header state={state} preset={preset} setLevel={setLevel} setMode={setMode} />
        <Container flexGrow={1} alignSelf="stretch" flexDirection="row" gap={16} minHeight={0}>
          <SummaryPanel state={state} preset={preset} />
          <WorkSurface state={state} preset={preset} />
        </Container>
      </Fullscreen>
    </Canvas>
  )
}

function Header({
  state,
  preset,
  setLevel,
  setMode,
}: {
  state: SceneState
  preset: Preset
  setLevel: (level: number) => void
  setMode: (mode: Mode) => void
}) {
  return (
    <Container
      height={96}
      alignSelf="stretch"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      gap={20}
      padding={18}
      borderRadius={8}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#d7dee8"
    >
      <Container flexDirection="column" gap={4}>
        <Text fontSize={26} fontWeight="bold" color={ink}>
          R3F UI Performance Lab
        </Text>
        <Text color={muted}>Preset {preset.label} keeps {preset.items.toLocaleString()} live cards in view.</Text>
      </Container>
      <Container flexDirection="row" gap={14} alignItems="center">
        <SegmentedControl
          values={modes}
          value={state.mode}
          onChange={(value) => setMode(value as Mode)}
          width={330}
        />
        <Container flexDirection="row" gap={6} alignItems="center">
          {presets.map((item, index) => (
            <StepButton
              key={item.label}
              selected={state.level === index}
              label={`${index + 1}`}
              onClick={() => setLevel(index)}
            />
          ))}
        </Container>
      </Container>
    </Container>
  )
}

function SegmentedControl({
  values,
  value,
  onChange,
  width,
}: {
  values: Array<{ id: string; label: string }>
  value: string
  onChange: (value: string) => void
  width: number
}) {
  return (
    <Container
      flexDirection="row"
      width={width}
      height={42}
      padding={4}
      gap={4}
      borderRadius={8}
      backgroundColor="#e8edf2"
    >
      {values.map((item) => {
        const selected = value === item.id
        return (
          <Container
            key={item.id}
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
            borderRadius={6}
            backgroundColor={selected ? '#172033' : '#e8edf2'}
            hover={{ backgroundColor: selected ? '#172033' : '#d9e1ea' }}
            onClick={() => onChange(item.id)}
          >
            <Text color={selected ? '#ffffff' : ink} fontSize={13}>
              {item.label}
            </Text>
          </Container>
        )
      })}
    </Container>
  )
}

function StepButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <Container
      width={36}
      height={36}
      alignItems="center"
      justifyContent="center"
      borderRadius={6}
      backgroundColor={selected ? '#2d6cdf' : '#ffffff'}
      borderWidth={1}
      borderColor={selected ? '#2d6cdf' : '#cad3df'}
      hover={{ backgroundColor: selected ? '#245bbd' : '#eef3f7' }}
      onClick={onClick}
    >
      <Text color={selected ? '#ffffff' : ink} fontSize={13} fontWeight="bold">
        {label}
      </Text>
    </Container>
  )
}

function SummaryPanel({ state, preset }: { state: SceneState; preset: Preset }) {
  const rows = [
    ['Mode', state.mode],
    ['Cards', preset.items.toLocaleString()],
    ['Columns', preset.columns.toLocaleString()],
    ['Text runs', (state.mode === 'cards' ? preset.items : preset.items * 2).toLocaleString()],
    ['Signals', state.mode === 'sampled' ? preset.items.toLocaleString() : '0'],
  ]

  return (
    <Container
      width={300}
      flexShrink={0}
      flexDirection="column"
      gap={14}
      padding={18}
      borderRadius={8}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#d7dee8"
    >
      <Text fontSize={18} fontWeight="bold" color={ink}>
        Load Shape
      </Text>
      {rows.map(([label, value]) => (
        <Container key={label} height={38} flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text color={muted}>{label}</Text>
          <Text color={ink} fontWeight="bold">
            {value}
          </Text>
        </Container>
      ))}
      <Container height={1} backgroundColor="#d7dee8" />
      <Text color={muted} lineHeight="150%">
        Cards isolates layout and glyph instancing. Decorated adds panel groups, hover styles, borders, and depth.
        Sampled adds one relative-center effect and color signal per card.
      </Text>
    </Container>
  )
}

function WorkSurface({ state, preset }: { state: SceneState; preset: Preset }) {
  const columns = preset.columns
  const rows = Math.ceil(preset.items / columns)
  const cellWidth = state.level > 4 ? 38 : state.level > 2 ? 46 : 58
  const cellHeight = state.mode === 'cards' ? 30 : 40
  const surfaceWidth = columns * cellWidth
  const surfaceHeight = rows * cellHeight
  const items = useMemo(
    () =>
      new Array(preset.items).fill(null).map((_, index) => ({
        id: index,
        hue: palette[index % palette.length]!,
        value: 20 + ((index * 17) % 80),
        radius: 3 + (index % 4),
        border: index % 3 === 0 ? 1 : 0,
        z: (index % 8) * 0.25,
      })),
    [preset.items],
  )

  return (
    <Container
      flexGrow={1}
      minWidth={0}
      overflow="scroll"
      padding={14}
      borderRadius={8}
      backgroundColor="#f8fafc"
      borderWidth={1}
      borderColor="#d7dee8"
    >
      <Container
        width={surfaceWidth}
        height={surfaceHeight}
        flexDirection="row"
        flexWrap="wrap"
        alignContent="flex-start"
        gap={0}
      >
        {items.map((item) =>
          state.mode === 'sampled' ? (
            <SampledCard key={item.id} item={item} width={cellWidth} height={cellHeight} surfaceWidth={surfaceWidth} />
          ) : (
            <StressCard
              key={item.id}
              item={item}
              width={cellWidth}
              height={cellHeight}
              decorated={state.mode === 'decorated'}
            />
          ),
        )}
      </Container>
    </Container>
  )
}

type Item = {
  id: number
  hue: string
  value: number
  radius: number
  border: number
  z: number
}

function StressCard({
  item,
  width,
  height,
  decorated,
}: {
  item: Item
  width: number
  height: number
  decorated: boolean
}) {
  return (
    <Container
      width={width}
      height={height}
      padding={decorated ? 5 : 3}
      flexDirection="column"
      justifyContent="center"
      gap={2}
      backgroundColor={decorated ? item.hue : '#ffffff'}
      borderRadius={decorated ? item.radius : 2}
      borderWidth={decorated ? item.border : 0}
      borderColor="#7b8794"
      transformTranslateZ={decorated ? item.z : 0}
      {...(decorated ? { hover: { backgroundColor: '#ffffff', borderColor: '#172033' } } : {})}
    >
      <Text pointerEvents="none" color={ink} fontSize={decorated ? 11 : 10}>
        {item.id}
      </Text>
      {decorated && (
        <Text pointerEvents="none" color="#334155" fontSize={9}>
          {item.value}%
        </Text>
      )}
    </Container>
  )
}

function SampledCard({
  item,
  width,
  height,
  surfaceWidth,
}: {
  item: Item
  width: number
  height: number
  surfaceWidth: number
}) {
  const color = useMemo(() => signal(new Color(item.hue)), [item.hue])
  const ref = useRef<VanillaContainer>(null)

  useEffect(() => {
    const internals = ref.current
    if (internals == null) {
      return
    }
    return effect(() => {
      const center = internals.relativeCenter.value
      if (center == null) {
        return
      }
      const wave = (Math.sin((center[0] / surfaceWidth) * Math.PI * 4) + 1) * 0.5
      color.value = new Color().setHSL((wave + item.id * 0.0007) % 1, 0.68, 0.62)
    })
  }, [color, item.id, surfaceWidth])

  return (
    <Container
      ref={ref}
      width={width}
      height={height}
      padding={5}
      flexDirection="column"
      justifyContent="center"
      gap={2}
      backgroundColor={color}
      borderRadius={item.radius}
      borderWidth={item.border}
      borderColor="#64748b"
      transformTranslateZ={item.z}
      hover={{ backgroundColor: '#ffffff', borderColor: '#172033' }}
    >
      <Text pointerEvents="none" color={ink} fontSize={10}>
        {item.id}
      </Text>
      <Text pointerEvents="none" color="#334155" fontSize={9}>
        {item.value}%
      </Text>
    </Container>
  )
}

function PerformanceBridge({
  state,
  setState,
}: {
  state: SceneState
  setState: (updater: (current: SceneState) => SceneState) => void
}) {
  const gl = useThree((threeState) => threeState.gl)
  const scene = useThree((threeState) => threeState.scene)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    window.__uikitPerf = {
      getState: () => ({
        ...latest.current,
        ...presets[latest.current.level]!,
        objects: countObjects(scene),
        render: { ...gl.info.render },
      }),
      setLevel: (level) => setState((current) => ({ ...current, level: clampLevel(level) })),
      setMode: (mode) => setState((current) => ({ ...current, mode })),
      setComplexity: (level, mode) =>
        setState((current) => ({
          mode: mode ?? current.mode,
          level: clampLevel(level),
        })),
    }
    return () => {
      delete window.__uikitPerf
    }
  }, [gl, scene, setState])

  useFrame(() => {
    gl.info.reset()
  })

  return null
}

function readInitialState(): SceneState {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const levelParam = params.get('level')
  const level = levelParam == null ? undefined : Number(levelParam)
  return {
    mode: mode === 'decorated' || mode === 'sampled' ? mode : 'cards',
    level: level != null && Number.isFinite(level) ? clampLevel(level) : 1,
  }
}

function clampLevel(level: number) {
  return Math.min(Math.max(Math.round(level), 0), presets.length - 1)
}

function countObjects(root: { traverse: (callback: () => void) => void }) {
  let count = 0
  root.traverse(() => {
    count += 1
  })
  return count
}
