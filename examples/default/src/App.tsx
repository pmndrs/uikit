import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, Container, getPreferredColorScheme, setPreferredColorScheme } from '@react-three/uikit'
import { Copy, Moon, Sun, SunMoon } from '@react-three/uikit-lucide'

import { Defaults, colors } from '@/theme'
import { Button } from '@/button'
import { Card } from '@/card'
import { Separator } from '@/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs'
import { DialogAnchor } from '@/dialog.js'
import { XWebPointers, noEvents } from '@coconut-xr/xinteraction/react'
import { TooltipDemo } from './components/tooltip'
import { AccordionDemo } from './components/accordion'
import { AlertDemo } from './components/alert'
import { AlertDialogDemo } from './components/alert-dialog'
import { AvatarDemo } from './components/avatar'
import { BadgeDemo } from './components/badge'
import { ButtonDemo } from './components/button'
import { CardDemo } from './components/card'
import { CheckboxDemo } from './components/checkbox'
import { DialogDemo } from './components/dialog'
import { PaginationDemo } from './components/pagination'
import { ProgressDemo } from './components/progress'
import { RadioGroupDemo } from './components/radio-group'
import { SeparatorDemo } from './components/separator'
import { SkeletonDemo } from './components/skeleton'
import { SliderDemo } from './components/slider'
import { SwitchDemo } from './components/switch'
import { TabsDemo } from './components/tabs'
import { ToggleDemo } from './components/toggle'
import { ToggleGroupDemo } from './components/toggle-group'

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
      <XWebPointers />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Defaults>
        <Fullscreen scrollbarColor="black" backgroundColor={colors.background} alignItems="center" padding={32}>
          <DialogAnchor>
            <Tabs alignSelf="stretch" flexGrow={1} value={component} onValueChange={setComponent}>
              <TabsList height={55} paddingBottom={10} overflow="scroll" maxWidth="100%">
                {Object.keys(componentPages).map((name) => (
                  <TabsTrigger value={name} key={name}>
                    <Text>
                      {name[0].toUpperCase()}
                      {name.slice(1)}
                    </Text>
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(componentPages).map(([name, Component]) => (
                <TabsContent flexGrow={1} alignItems="center" justifyContent="center" value={name} key={name}>
                  <Container>
                    <Component />
                  </Container>
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
              <Text padding={8}>npx uikit component add apfel {component}</Text>
              <Button
                onClick={() => navigator.clipboard.writeText(`npx uikit component add apfel ${component}`)}
                size="icon"
                variant="secondary"
              >
                <Copy />
              </Button>
            </Card>
          </DialogAnchor>
        </Fullscreen>
      </Defaults>
    </Canvas>
  )
}
