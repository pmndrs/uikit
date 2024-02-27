import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Container, Root, Text } from '@react-three/uikit'
import { Activity, CreditCard, DollarSign, Users } from '@react-three/uikit-lucide'

import { DefaultColors, colors } from '@/defaults'
import { Button } from '@/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs'
import { DialogAnchor } from '@/dialog'

import { CalendarDateRangePicker } from './components/DateRangePicker'
import { MainNav } from './components/MainNav'
import { Overview } from './components/Overview'
import { RecentSales } from './components/RecentSales'
import { TeamSwitcher } from './components/TeamSwitcher'
import { UserNav } from './components/UserNav'

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 12], fov: 35 }}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true }}
    >
      <Root backgroundColor={0xffffff} sizeX={8.34} sizeY={5.58} pixelSize={0.01}>
        <DefaultColors>
          <DialogAnchor>
            <Container width="100%" height="100%" overflow="scroll">
              <DashboardPage open={open} setOpen={setOpen} />
            </Container>
          </DialogAnchor>
        </DefaultColors>
      </Root>
      <Environment background blur={0.1} preset="city" />
      <EffectComposer>
        <TiltShift2 blur={0.025} />
      </EffectComposer>
      <OrbitControls makeDefault enableZoom={false} />
    </Canvas>
  )
}

export function DashboardPage({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Container flexDirection="column">
      <Container borderBottom={1}>
        <Container height={64} alignItems="center" flexDirection="row" paddingX={16}>
          <TeamSwitcher />
          <MainNav marginX={24} />
          <Container marginLeft="auto" flexDirection="row" alignItems="center" gap={16}>
            <UserNav open={open} setOpen={setOpen} />
          </Container>
        </Container>
      </Container>
      <Container flexGrow={1} gap={16} padding={32} paddingTop={24}>
        <Container flexDirection="row" justifyContent="space-between" gap={8}>
          <Text fontSize={30} lineHeight={1}>
            Dashboard
          </Text>
          <Container flexDirection="row" gap={8} alignItems="center">
            <CalendarDateRangePicker />
            <Button>
              <Text>Download</Text>
            </Button>
          </Container>
        </Container>
        <Tabs defaultValue="overview" gap={16}>
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
          <TabsContent value="overview" gap={16}>
            <Container gap={16} lg={{ flexDirection: 'row' }}>
              <Container flexGrow={1} gap={16} flexDirection="row">
                <Card flexBasis={0} flexGrow={1}>
                  <CardHeader flexDirection="row" alignItems="center" justifyContent="space-between" paddingBottom={8}>
                    <CardTitle>
                      <Text fontSize={14} lineHeight={1.43}>
                        Total Revenue
                      </Text>
                    </CardTitle>
                    <DollarSign width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent>
                    <Text fontSize={24} lineHeight={1.3333}>
                      $45,231.89
                    </Text>
                    <Text fontSize={12} lineHeight={1.3333} color={colors.mutedForeground}>
                      +20.1% from last month
                    </Text>
                  </CardContent>
                </Card>
                <Card flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={8}
                    gap={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight={1.43}>
                        Subscriptions
                      </Text>
                    </CardTitle>
                    <Users height={16} width={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent>
                    <Text fontSize={24} lineHeight={1.3333}>
                      +2350
                    </Text>
                    <Text fontSize={12} lineHeight={1.3333} color={colors.mutedForeground}>
                      +180.1% from last month
                    </Text>
                  </CardContent>
                </Card>
              </Container>
              <Container flexGrow={1} gap={16} flexDirection="row">
                <Card flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={2}
                    gap={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight={1.43}>
                        Sales
                      </Text>
                    </CardTitle>
                    <CreditCard width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent>
                    <Text fontSize={24} lineHeight={1.3333}>
                      +12,234
                    </Text>
                    <Text fontSize={12} lineHeight={1.3333} color={colors.mutedForeground}>
                      +19% from last month
                    </Text>
                  </CardContent>
                </Card>
                <Card flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={2}
                    gap={0}
                  >
                    <CardTitle>
                      <Text fontSize={14} lineHeight={1.43}>
                        Active Now
                      </Text>
                    </CardTitle>
                    <Activity width={16} height={16} color={colors.mutedForeground} />
                  </CardHeader>
                  <CardContent>
                    <Text fontSize={24} lineHeight={1.3333}>
                      +573
                    </Text>
                    <Text fontSize={12} lineHeight={1.3333} color={colors.mutedForeground}>
                      +201 since last hour
                    </Text>
                  </CardContent>
                </Card>
              </Container>
            </Container>
            <Container lg={{ flexDirection: 'row' }} flexDirection="column" gap={16}>
              <Card lg={{ flexGrow: 4 }}>
                <CardHeader>
                  <CardTitle>
                    <Text>Overview</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent paddingLeft={8}>
                  <Overview />
                </CardContent>
              </Card>
              <Card lg={{ flexGrow: 3 }}>
                <CardHeader>
                  <CardTitle>
                    <Text>Recent Sales</Text>
                  </CardTitle>
                  <CardDescription>
                    <Text>You made 265 sales this month.</Text>
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
