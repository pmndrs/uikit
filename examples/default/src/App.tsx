import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, getPreferredColorScheme, setPreferredColorScheme } from '@react-three/uikit'
import { Copy, Moon, Sun, SunMoon } from '@react-three/uikit-lucide'
import { colors, Button, Card, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@react-three/uikit-default'
import { TooltipDemo } from './components/tooltip.js'
import { AccordionDemo } from './components/accordion.js'
import { AlertDemo } from './components/alert.js'
import { AlertDialogDemo } from './components/alert-dialog.js'
import { AvatarDemo } from './components/avatar.js'
import { BadgeDemo } from './components/badge.js'
import { ButtonDemo } from './components/button.js'
import { CardDemo } from './components/card.js'
import { CheckboxDemo } from './components/checkbox.js'
import { DialogDemo } from './components/dialog.js'
import { PaginationDemo } from './components/pagination.js'
import { ProgressDemo } from './components/progress.js'
import { RadioGroupDemo } from './components/radio-group.js'
import { SeparatorDemo } from './components/separator.js'
import { SkeletonDemo } from './components/skeleton.js'
import { SliderDemo } from './components/slider.js'
import { SwitchDemo } from './components/switch.js'
import { TabsDemo } from './components/tabs.js'
import { ToggleDemo } from './components/toggle.js'
import { ToggleGroupDemo } from './components/toggle-group.js'
import InputDemo from './components/input.js'
import TextareDemo from './components/textarea.js'
import { VideoDemo } from './components/video.js'
import { noEvents, PointerEvents } from '@react-three/xr'

const componentPages = {
  accordion: AccordionDemo,
  alert: AlertDemo,
  'alert-dialog': AlertDialogDemo,
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  //label: LabelDemo,
  pagination: PaginationDemo,
  progress: ProgressDemo,
  'radio-group': RadioGroupDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  slider: SliderDemo,
  switch: SwitchDemo,
  tabs: TabsDemo,
  toggle: ToggleDemo,
  'toggle-group': ToggleGroupDemo,
  tooltip: TooltipDemo,
  input: InputDemo,
  textarea: TextareDemo,
  video: VideoDemo,
}

const defaultComponent = 'card'

export default function App() {
  const [component, set] = useState<keyof typeof componentPages>(() => {
    const params = new URLSearchParams(window.location.search)
    let selected = params.get('component')
    if (selected == null || !(selected in componentPages)) {
      selected = defaultComponent
    }
    return selected as keyof typeof componentPages
  })
  const setComponent = (value: keyof typeof componentPages) => {
    const params = new URLSearchParams(window.location.search)
    params.set('component', value)
    history.replaceState(null, '', '?' + params.toString())
    set(value)
  }
  const [pcs, updatePCS] = useState(() => getPreferredColorScheme())
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <PointerEvents />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen flexDirection="column" backgroundColor={colors.background} alignItems="center" padding={32}>
        <Tabs alignSelf="stretch" flexGrow={1} value={component} onValueChange={(value) => setComponent(value as any)}>
          <TabsList height={55} paddingBottom={10} overflow="scroll" maxWidth="100%">
            {Object.keys(componentPages).map((name) => (
              <TabsTrigger flexShrink={0} value={name} key={name}>
                <Text>
                  {name[0]!.toUpperCase()}
                  {name.slice(1)}
                </Text>
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(componentPages).map(([name, Component]) => (
            <TabsContent
              flexDirection="column"
              flexGrow={1}
              alignItems="center"
              justifyContent="center"
              value={name}
              key={name}
            >
              <Component />
            </TabsContent>
          ))}
        </Tabs>
        <Card padding={8} flexDirection="row" gap={8} alignItems="center">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setPreferredColorScheme(pcs === 'light' ? 'dark' : pcs === 'dark' ? 'system' : 'light')
              updatePCS(getPreferredColorScheme())
            }}
          >
            {pcs === 'dark' ? <Moon /> : pcs === 'system' ? <SunMoon /> : <Sun />}
          </Button>
          <Separator orientation="vertical" />
          <Text padding={8}>
            import {'{'} {`${component[0]!.toUpperCase()}${component.slice(1)}`} {'}'} from
            "@react-three/uikit-default";
          </Text>
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                `import { ${component[0]!.toUpperCase()}${component.slice(1)} } from "@react-three/uikit-default"`,
              )
            }
            size="icon"
            variant="secondary"
          >
            <Copy />
          </Button>
        </Card>
      </Fullscreen>
    </Canvas>
  )
}
