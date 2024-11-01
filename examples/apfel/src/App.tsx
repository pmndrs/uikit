import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, Container } from '@react-three/uikit'
import { Copy } from '@react-three/uikit-lucide'
import { Card } from '@/card.js'
import { Button } from '@/button.js'
import { Tabs, TabsButton } from '@/tabs.js'
import { Defaults } from '@/theme.js'
import { useState } from 'react'
import { TextOnCard } from './components/card.js'
import { CheckboxOnCard } from './components/checkbox.js'
import { ButtonsOnCard } from './components/button.js'
import { ListsOnCard } from './components/list.js'
import { SlidersOnCard } from './components/slider.js'
import { TabsOnCard } from './components/tabs.js'
import { TabBarWithText } from './components/tab-bar.js'
import { ProgressBarsOnCard } from './components/progress.js'
import { LoadingSpinnersOnCard } from './components/loading.js'
import { InputsOnCard } from './components/input.js'
import { noEvents, PointerEvents } from '@react-three/xr'

const componentPages = {
  card: TextOnCard,
  checkbox: CheckboxOnCard,
  button: ButtonsOnCard,
  list: ListsOnCard,
  slider: SlidersOnCard,
  tabs: TabsOnCard,
  'tab-bar': TabBarWithText,
  progress: ProgressBarsOnCard,
  loading: LoadingSpinnersOnCard,
  input: InputsOnCard,
}
const defaultComponent = 'button'

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
  const ComponentPage = componentPages[component]
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <PointerEvents />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      <Defaults>
        <Fullscreen
          overflow="scroll"
          scrollbarColor="black"
          backgroundColor="white"
          flexDirection="column"
          gap={32}
          paddingX={32}
          alignItems="center"
          padding={32}
        >
          <Card flexShrink={0} borderRadius={32} gap={32} paddingX={16}>
            <Container flexDirection="row" maxWidth="100%" overflow="scroll" paddingY={16}>
              <Tabs flexShrink={0} value={component} onValueChange={setComponent}>
                {Object.keys(componentPages).map((name) => (
                  <TabsButton value={name} key={name}>
                    <Text>
                      {name[0].toUpperCase()}
                      {name.slice(1)}
                    </Text>
                  </TabsButton>
                ))}
              </Tabs>
            </Container>
          </Card>
          <Container flexShrink={0} flexGrow={1} flexDirection="row" justifyContent="center" alignItems="center">
            <ComponentPage />
          </Container>

          <Card flexShrink={0} padding={8} flexDirection="row" gap={8} alignItems="center">
            <Text backgroundColor="black" padding={8} borderRadius={16} marginLeft={8}>
              npx uikit component add apfel {component}
            </Text>
            <Button
              onClick={() => navigator.clipboard.writeText(`npx uikit component add apfel ${component}`)}
              variant="icon"
            >
              <Copy />
            </Button>
          </Card>
        </Fullscreen>
      </Defaults>
    </Canvas>
  )
}
