import { StrictMode } from "react";
import { Canvas } from "@react-three/fiber";
import { createRoot } from "react-dom/client";
import { Container, Fullscreen, Root, Text } from "@react-three/uikit";
import { DefaultColors, colors } from "@/defaults.js";
import { Button } from "@/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs.js";
import { CalendarDateRangePicker } from "./date-range-picker.js";
import { MainNav } from "./main-nav.js";
import { Overview } from "./overview.js";
import { RecentSales } from "./recent-sales.js";
import { TeamSwitcher } from "./team-switcher.js";
import { UserNav } from "./user-nav.js";
import { Activity, CreditCard, DollarSign, Users } from "@react-three/uikit-lucide";
import { Environment, OrbitControls } from "@react-three/drei";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function App() {
  return (
    <Canvas style={{ height: "100dvh", touchAction: "none" }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={["black"]} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <OrbitControls />
      <Environment preset="city" background />
      <group rotation-y={Math.PI / 4} position-x={-1.5}>
        <Root
          hover={{ transformTranslateZ: 500 }}
          anchorX="right"
          pixelSize={0.002}
          sizeX={1.5}
          backgroundColor="white"
          backgroundOpacity={0.9}
          borderRadius={16}
        >
          <DefaultColors>
            <DashboardPage />
          </DefaultColors>
        </Root>
      </group>
      <Root
        pixelSize={0.002}
        sizeX={2.25}
        hover={{ transformTranslateZ: 500 }}
        backgroundColor="white"
        backgroundOpacity={0.9}
        borderRadius={16}
      >
        <DefaultColors>
          <DashboardPage />
        </DefaultColors>
      </Root>

      <group rotation-y={-Math.PI / 4} position-x={1.5}>
        <Root
          hover={{ transformTranslateZ: 500 }}
          anchorX="left"
          pixelSize={0.002}
          sizeX={3.5}
          backgroundColor="white"
          backgroundOpacity={0.9}
          borderRadius={16}
        >
          <DefaultColors>
            <DashboardPage />
          </DefaultColors>
        </Root>
      </group>
    </Canvas>
  );
}

export function DashboardPage() {
  return (
    <Container flexDirection="column">
      <Container borderBottom={1}>
        <Container height={64} alignItems="center" flexDirection="row" paddingX={16}>
          <TeamSwitcher />
          <MainNav marginX={24} />
          <Container marginLeft="auto" flexDirection="row" alignItems="center" gap={16}>
            <UserNav />
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
            <Container gap={16} lg={{ flexDirection: "row" }}>
              <Container flexGrow={1} gap={16} flexDirection="row">
                <Card backgroundOpacity={0.8} flexBasis={0} flexGrow={1}>
                  <CardHeader
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingBottom={8}
                  >
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
                <Card backgroundOpacity={0.8} flexBasis={0} flexGrow={1}>
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
                <Card backgroundOpacity={0.8} flexBasis={0} flexGrow={1}>
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
                <Card backgroundOpacity={0.8} flexBasis={0} flexGrow={1}>
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
            <Container lg={{ flexDirection: "row" }} flexDirection="column" gap={16}>
              <Card backgroundOpacity={0.8} lg={{ flexGrow: 4 }}>
                <CardHeader>
                  <CardTitle>
                    <Text>Overview</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent paddingLeft={8}>
                  <Overview />
                </CardContent>
              </Card>
              <Card backgroundOpacity={0.8} lg={{ flexGrow: 3 }}>
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
  );
}
