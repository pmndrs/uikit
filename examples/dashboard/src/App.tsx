import { useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Gltf } from '@react-three/drei'
import { Container, Content, Fullscreen, Input, Text, setPreferredColorScheme } from '@react-three/uikit'
import { Activity, CreditCard, DollarSign, Users } from '@react-three/uikit-lucide'
import {
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  colors,
} from '@react-three/uikit-default'
import { CalendarDateRangePicker } from './components/DateRangePicker.js'
import { MainNav } from './components/MainNav.js'
import { Overview } from './components/Overview.js'
import { RecentSales } from './components/RecentSales.js'
import { TeamSwitcher } from './components/TeamSwitcher.js'
import { UserNav } from './components/UserNav.js'
import { create } from 'zustand'
import { noEvents, PointerEvents } from '@react-three/xr'
import { Highlighter } from './components/Highlighter.js'

setPreferredColorScheme('light')

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <FrameCounter />
      <Canvas
        events={noEvents}
        frameloop="demand"
        flat
        camera={{ position: [0, 0, 18], fov: 35, zoom: 100 }}
        style={{ height: '100dvh', touchAction: 'none' }}
        orthographic
      >
        <Environment preset="studio" environmentIntensity={2} />
        <CountFrames />
        <PointerEvents />
        <Fullscreen distanceToCamera={1} backgroundColor={0xffffff} dark={{ backgroundColor: 0x0 }}>
          <Highlighter>
            <Container flexDirection="column" width="100%" height="100%" overflow="scroll">
              <DashboardPage open={open} setOpen={setOpen} />
            </Container>
          </Highlighter>
        </Fullscreen>
      </Canvas>
    </>
  )
}

const useFrameCounter = create(() => 0)

function CountFrames() {
  useFrame(() => useFrameCounter.setState(useFrameCounter.getState() + 1))
  return null
}

function FrameCounter() {
  const counter = useFrameCounter()
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'black',
        fontSize: '2rem',
        padding: '0.5rem 1rem',
        color: 'white',
        fontFamily: 'sans-serif',
        zIndex: 100,
      }}
    >
      {counter}
    </div>
  )
}

export function DashboardPage({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Container flexShrink={0} flexDirection="column">
      <Container gap={20}>
        <Input
          borderWidth={2}
          borderRadius={6}
          borderColor="gray"
          paddingTop={2}
          paddingBottom={30}
          paddingLeft={10}
          paddingRight={30}
          defaultValue="Text Container"
        />
        <Text
          borderWidth={2}
          borderRadius={6}
          borderColor="gray"
          paddingTop={2}
          paddingBottom={30}
          paddingLeft={10}
          paddingRight={30}
        >
          Text Container
        </Text>
      </Container>
      <Container flexShrink={0} flexDirection="column" borderBottomWidth={1}>
        <Container height={64} alignItems="center" flexDirection="row" paddingX={16}>
          <TeamSwitcher />
          <MainNav marginX={24} />
          <Container marginLeft="auto" flexDirection="row" alignItems="center" gap={16}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('https://github.com/pmndrs/uikit/tree/main/examples/dashboard', '_blank')}
            >
              <Text>Source Code</Text>
            </Button>
            <UserNav open={open} setOpen={setOpen} />
          </Container>
        </Container>
      </Container>
      <Container flexDirection="column" flexGrow={1} gap={16} padding={32} paddingTop={24}>
        <Container flexShrink={0} flexDirection="row" justifyContent="space-between" gap={8}>
          <Text fontSize={30} lineHeight="100%">
            Dashboard
          </Text>
          <Container flexDirection="row" gap={8} alignItems="center">
            <CalendarDateRangePicker />
            <Button>
              <Text>Download</Text>
            </Button>
          </Container>
        </Container>
        <Tabs flexDirection="column" defaultValue="overview" gap={16}>
          <TabsList alignSelf="flex-start">
            <TabsTrigger value="overview">
              <Text>Overview</Text>
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              <Text>Analytics</Text>
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              <Text>Reports</Text>
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              <Text>Notifications</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent flexShrink={0} flexDirection="column" value="overview" gap={16}>
            <Container flexShrink={0} flexDirection="column" gap={16} lg={{ flexDirection: 'row' }}>
              <Container flexGrow={1} gap={16} flexDirection="row">
                <Card flexDirection="column" flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexShrink={0}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={8}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight="20px">
                        It's a macbook
                      </Text>
                    </CardTitle>
                    <DollarSign width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent alignItems="center" flexShrink={0} flexDirection="column">
                    <Content width="50%" depthAlign="front" color="initial" keepAspectRatio>
                      <Gltf rotation-y={(30 / 180) * Math.PI} rotation-x={(30 / 180) * Math.PI} src="./mac-draco.glb" />
                    </Content>
                  </CardContent>
                </Card>
                <Card flexDirection="column" flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={8}
                    flexShrink={0}
                    gap={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight="20px">
                        Subscriptions
                      </Text>
                    </CardTitle>
                    <Users height={16} width={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent flexShrink={0} flexDirection="column">
                    <Text fontSize={24} lineHeight="32px">
                      +2350
                    </Text>
                    <Text fontSize={12} lineHeight="16px" color={colors.mutedForeground}>
                      +180.1% from last month
                    </Text>
                  </CardContent>
                </Card>
              </Container>
              <Container flexGrow={1} gap={16} flexDirection="row">
                <Card flexDirection="column" flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={2}
                    gap={0}
                    flexShrink={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight="20px">
                        Sales
                      </Text>
                    </CardTitle>
                    <CreditCard width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent flexShrink={0} flexDirection="column">
                    <Text fontSize={24} lineHeight="32px">
                      +12,234
                    </Text>
                    <Text fontSize={12} lineHeight="16px" color={colors.mutedForeground}>
                      +19% from last month
                    </Text>
                  </CardContent>
                </Card>
                <Card flexDirection="column" flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={2}
                    gap={0}
                    flexShrink={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight="20px">
                        Active Now
                      </Text>
                    </CardTitle>
                    <Activity width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent flexShrink={0} flexDirection="column">
                    <Text fontSize={24} lineHeight="32px">
                      +573
                    </Text>
                    <Text fontSize={12} lineHeight="16px" color={colors.mutedForeground}>
                      +201 since last hour
                    </Text>
                  </CardContent>
                </Card>
              </Container>
            </Container>
            <Container flexShrink={0} lg={{ flexDirection: 'row' }} flexDirection="column" gap={16}>
              <Card flexDirection="column" lg={{ flexGrow: 4 }} flexBasis={0}>
                <CardHeader>
                  <CardTitle>
                    <Text>Overview</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent flexShrink={0} paddingLeft={8}>
                  <Overview />
                </CardContent>
              </Card>
              <Card flexDirection="column" lg={{ flexGrow: 3 }} flexBasis={0}>
                <CardHeader>
                  <CardTitle>
                    <Text>Recent Sales</Text>
                  </CardTitle>
                  <CardDescription>
                    <Text>You made 265 sales this month.</Text>
                  </CardDescription>
                </CardHeader>
                <CardContent flexDirection="column">
                  <RecentSales />
                </CardContent>
              </Card>
            </Container>
          </TabsContent>
        </Tabs>
      </Container>
    </Container>
  )
}
