import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, Container } from '@react-three/uikit'
import { Copy } from '@react-three/uikit-lucide'
import { XWebPointers, noEvents } from '@coconut-xr/xinteraction/react'
import { Card } from '@/card'
import { Button } from '@/button'
import { Tabs, TabsButton } from '@/tabs'
import { Defaults } from '@/theme'
import { useState } from 'react'
import { TextOnCard } from './components/card'
import { CheckboxOnCard } from './components/checkbox'
import { ButtonsOnCard } from './components/button'
import { ListsOnCard } from './components/list'
import { SlidersOnCard } from './components/slider'
import { TabsOnCard } from './components/tabs'
import { TabBarWithText } from './components/tab-bar'
import { ProgressBarsOnCard } from './components/progress'
import { LoadingSpinnersOnCard } from './components/loading'

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
      <XWebPointers />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      <Defaults>
        <Fullscreen
          overflow="scroll"
          scrollbarColor="black"
          backgroundColor="white"
          gap={32}
          paddingX={32}
          alignItems="center"
          padding={32}
        >
          <Card borderRadius={32} gap={32} paddingX={16}>
            <Container flexDirection="row" maxWidth="100%" overflow="scroll" paddingY={16}>
              <Tabs value={component} onValueChange={setComponent}>
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
          <Container flexGrow={1} flexDirection="row" justifyContent="center" alignItems="center">
            <ComponentPage />
          </Container>

          <Card padding={8} flexDirection="row" gap={8} alignItems="center">
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
