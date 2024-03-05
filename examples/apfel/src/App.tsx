import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, Container } from '@react-three/uikit'
import { BoxSelect, ChevronRight, Copy, Info } from '@react-three/uikit-lucide'
import { XWebPointers, noEvents } from '@coconut-xr/xinteraction/react'
import { Card } from '@/card'
import { Checkbox } from '@/checkbox'
import { List, ListItem } from '@/list'
import { Button } from '@/button'
import { Progress } from '@/progress'
import { Tabs, TabsButton } from '@/tabs'
import { Loading } from '@/loading'
import { Slider } from '@/slider'
import { TabBar, TabBarItem } from '@/tab-bar'
import { Defaults } from '@/theme'
import { useState } from 'react'

const componentPages = {
  card: CardPage,
  checkbox: CheckboxesPage,
  button: ButtonsPage,
  list: ListsPage,
  slider: SlidersPage,
  tabs: TabsPage,
  tabBar: TabBarsPage,
  progress: ProgressPage,
  loading: LoadingPage,
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
          <Card overflow="scroll" borderRadius={32} gap={32} padding={16}>
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

export function CheckboxesPage() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="column" gapRow={16}>
      <Checkbox disabled defaultSelected={false} />
      <Checkbox defaultSelected={true} />
    </Card>
  )
}

export function CardPage() {
  return (
    <Card borderRadius={32} padding={32} gap={8} flexDirection="column">
      <Text fontSize={32}>Hello World!</Text>
      <Text fontSize={24} opacity={0.7}>
        This is the apfel kit.
      </Text>
    </Card>
  )
}

export function ButtonsPage() {
  return (
    <Container flexDirection="column" md={{ flexDirection: 'row' }} alignItems="center" gap={32}>
      <Card borderRadius={32} padding={16}>
        <Container flexDirection="row" gapColumn={16}>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl">
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" platter>
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" selected>
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" disabled>
              <BoxSelect />
            </Button>
          </Container>
        </Container>
      </Card>

      <Card borderRadius={32} padding={24}>
        <Container flexDirection="column" gapRow={32}>
          <Container flexDirection="row" gapColumn={16}>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm">
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md">
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg">
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" platter>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" selected>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" disabled>
                <Text>Label</Text>
              </Button>
            </Container>
          </Container>

          <Container flexDirection="row" gapColumn={16}>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm">
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md">
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg">
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" platter>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" selected>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" disabled>
                <Text>Label</Text>
              </Button>
            </Container>
          </Container>
        </Container>
      </Card>
    </Container>
  )
}

export function ListsPage() {
  return (
    <Container flexDirection="column" gapRow={32} alignItems="center">
      <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32}>
        <Card borderRadius={32} padding={16}>
          <List type="plain" width={400}>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}>
              <Text>Title</Text>
            </ListItem>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              selected
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
        <Card borderRadius={32} padding={16}>
          <List type="plain" width={400}>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              selected
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
      </Container>
      <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32}>
        <Card borderRadius={32} padding={16}>
          <List type="inset" width={400}>
            <ListItem
              isFirst
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}>
              <Text>Title</Text>
            </ListItem>
            <ListItem
              isLast
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
        <Card borderRadius={32} padding={16}>
          <List type="inset" width={400}>
            <ListItem
              isFirst
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              isLast
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
      </Container>
    </Container>
  )
}

export function ProgressPage() {
  return (
    <Card width={200} borderRadius={32} padding={16} flexDirection="column" gapRow={16}>
      <Progress value={0} />
      <Progress value={0.25} />
      <Progress value={0.5} />
      <Progress value={0.75} />
      <Progress value={1} />
    </Card>
  )
}

export function LoadingPage() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="row" gapColumn={16}>
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </Card>
  )
}

export function TabsPage() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="column" alignItems="flex-start" gapRow={16}>
      <Tabs defaultValue="1">
        <TabsButton value="1">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4">
          <Text>Long Label</Text>
        </TabsButton>
        <TabsButton value="5" disabled>
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
      <Tabs defaultValue="1">
        <TabsButton value="1">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4" disabled>
          <BoxSelect height={12} width={12} />
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
      <Tabs defaultValue="1" disabled>
        <TabsButton value="1">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4">
          <Text>Long Label</Text>
        </TabsButton>
        <TabsButton value="5" disabled>
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
    </Card>
  )
}

export function SlidersPage() {
  return (
    <Card
      borderRadius={32}
      padding={16}
      flexDirection="column"
      md={{ flexDirection: 'row' }}
      gapColumn={16}
      gapRow={32}
    >
      <Container flexDirection="column" gapRow={16} width={250}>
        <Slider size="xs" defaultValue={25} />
        <Slider size="sm" defaultValue={50} />
        <Slider size="md" defaultValue={75} icon={<BoxSelect />} />
        <Slider size="lg" defaultValue={100} icon={<BoxSelect />} />
      </Container>
      <Container flexDirection="column" gapRow={16} width={250}>
        <Slider size="xs" defaultValue={25} disabled />
        <Slider size="sm" defaultValue={50} disabled />
        <Slider size="md" defaultValue={75} disabled icon={<BoxSelect />} />
        <Slider size="lg" defaultValue={100} disabled icon={<BoxSelect />} />
      </Container>
    </Card>
  )
}

export function TabBarsPage() {
  return (
    <TabBar defaultValue="1">
      <TabBarItem value="1" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="2" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="3" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="4" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
    </TabBar>
  )
}
