import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Gltf, PerspectiveCamera } from '@react-three/drei'
import { Container, Content, Fullscreen, Text, setPreferredColorScheme } from '@react-three/uikit'
import { Activity, BellRing, CreditCard, DollarSign, Users } from '@react-three/uikit-lucide'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Switch,
  DialogFooter,
  VanillaDialog,
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

const notifications = [
  {
    title: 'Your call has been confirmed.',
    description: '1 hour ago',
  },
  {
    title: 'You have a new message!',
    description: '1 hour ago',
  },
  {
    title: 'Your subscription is expiring soon!',
    description: '2 hours ago',
  },
]

export default function App() {
  const [open, setOpen] = useState(false)
  const [dialog, setDialog] = useState<VanillaDialog | null>(null)
  return (
    <>
      <FrameCounter />
      <Canvas
        events={noEvents}
        frameloop="demand"
        flat
        camera={{ position: [0, 0, 18], fov: 35 }}
        style={{ height: '100dvh', touchAction: 'none' }}
      >
        <PerspectiveCamera fov={50} makeDefault={open} />
        <PerspectiveCamera fov={40} makeDefault={!open} />
        <Environment preset="studio" environmentIntensity={2} />
        <CountFrames />
        <PointerEvents />
        <Fullscreen distanceToCamera={100} backgroundColor={0xffffff} dark={{ backgroundColor: 0x0 }}>
          <Dialog
            renderOrder={1}
            depthTest={false}
            {...{ '*': { renderOrder: 1, depthTest: false } }}
            ref={(ref) => setDialog(ref)}
            open={open}
            onOpenChange={setOpen}
          >
            <DialogContent positionType="relative" sm={{ maxWidth: 425 }}>
              <DialogHeader>
                <DialogTitle>
                  <Text>Edit profile</Text>
                </DialogTitle>
                <DialogDescription>
                  <Text>Make changes to your profile here. Click save when you're done.</Text>
                </DialogDescription>
              </DialogHeader>
              <Container flexDirection="row" alignItems="center" gap={16} borderRadius={6} borderWidth={1} padding={16}>
                <BellRing />
                <Container gap={4}>
                  <Text fontWeight="medium" fontSize={14} lineHeight="100%">
                    Push Notifications
                  </Text>
                  <Text fontWeight="medium" fontSize={14} lineHeight="20px" color={colors.mutedForeground}>
                    Send notifications to device.
                  </Text>
                </Container>
                <Switch />
              </Container>
              <Container flexDirection="column">
                {notifications.map((notification, index) => (
                  <Container
                    key={index}
                    marginBottom={index === notifications.length - 1 ? 0 : 16}
                    paddingBottom={index === notifications.length - 1 ? 0 : 16}
                    alignItems="flex-start"
                    flexDirection="row"
                    gap={17}
                  >
                    <Container
                      height={8}
                      width={8}
                      transformTranslateY={4}
                      borderRadius={1000}
                      backgroundColor={0x0ea5e9}
                    />
                    <Container flexDirection="column" gap={4}>
                      <Text fontSize={14} lineHeight="100%">
                        {notification.title}
                      </Text>
                      <Text fontSize={14} lineHeight="20px" color={colors.mutedForeground}>
                        {notification.description}
                      </Text>
                    </Container>
                  </Container>
                ))}
              </Container>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>
                  <Text>Save changes</Text>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Highlighter>
            <Container flexDirection="column" width="100%" height="100%" overflow="scroll">
              <DashboardPage dialog={dialog} />
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
        bottom: 0,
        left: 0,
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

export function DashboardPage({ dialog }: { dialog: VanillaDialog | null }) {
  return (
    <Container flexShrink={0} flexDirection="column">
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
            <UserNav dialog={dialog} />
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
            <Button
              onClick={(e) => {
                //e has the correct types as specified in types/three-augmented.d.ts - PointerEvent from pmndrs/pointer-events
                console.log(e.pointerId)
              }}
            >
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
                    <Content width="50%" depthAlign="center" color="initial" keepAspectRatio>
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
