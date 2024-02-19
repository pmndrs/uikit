import { StrictMode, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createRoot } from "react-dom/client";
import { DefaultProperties, Fullscreen, Text, Container } from "@react-three/uikit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/accordion.js";
import {
  BellRing,
  Bold,
  Check,
  ChevronRight,
  Italic,
  Terminal,
  Underline,
} from "@react-three/uikit-lucide";
import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@/alert.js";
import { DefaultColors, colors } from "@/defaults.js";
import { Avatar } from "@/avatar.js";
import { Badge } from "@/badge.js";
import { Button } from "@/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/card.js";
import { Checkbox } from "@/checkbox.js";
import { Label } from "@/label.js";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/pagination.js";
import { Progress } from "@/progress.js";
import { RadioGroup, RadioGroupItem } from "@/radio-group.js";
import { Separator } from "@/separator.js";
import { Skeleton } from "@/skeleton.js";
import { Slider } from "@/slider.js";
import { Switch } from "@/switch.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/tabs.js";
import { Toggle } from "@/toggle.js";
import { ToggleGroup, ToggleGroupItem } from "@/toggle-group.js";

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
      <Fullscreen
        scrollbarColor="black"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        padding={32}
      >
        <Container flexDirection="row" justifyContent="center" width="100%" maxWidth={500}>
          <DefaultColors>
            <ToggleGroupDemo />
          </DefaultColors>
        </Container>
      </Fullscreen>
    </Canvas>
  );
}
export function ToggleGroupDemo() {
  return (
    <ToggleGroup>
      <ToggleGroupItem aria-label="Toggle bold">
        <Bold height={16} width={16} />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic">
        <Italic height={16} width={16} />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline">
        <Underline width={16} height={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function ToggleDemo() {
  return (
    <Toggle>
      <Bold height={16} width={16} />
    </Toggle>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" width={400}>
      <TabsList width="100%">
        <TabsTrigger value="account">
          <Text>Account</Text>
        </TabsTrigger>
        <TabsTrigger value="password">
          <Text>Password</Text>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>
              <Text>Account</Text>
            </CardTitle>
            <CardDescription>
              <Text>Make changes to your account here. Click save when you're done.</Text>
            </CardDescription>
          </CardHeader>
          <CardContent gap={8}>
            <Container gap={4}>
              <Label>
                <Text>Name</Text>
              </Label>
              <Text>Pedro Duarte</Text>
            </Container>
            <Container gap={4}>
              <Label>
                <Text>Username</Text>
              </Label>
              <Text>@peduarte</Text>
            </Container>
          </CardContent>
          <CardFooter>
            <Button>
              <Text>Save changes</Text>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>
              <Text>Password</Text>
            </CardTitle>
            <CardDescription>
              <Text>Change your password here. After saving, you'll be logged out.</Text>
            </CardDescription>
          </CardHeader>
          <CardContent gap={8}>
            <Container gap={4}>
              <Label>
                <Text>Current password</Text>
              </Label>
              <Text>password</Text>
            </Container>
            <Container gap={4}>
              <Label>
                <Text>New password</Text>
              </Label>
              <Text>password</Text>
            </Container>
          </CardContent>
          <CardFooter>
            <Button>
              <Text>Save password</Text>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export function SwitchDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={8}>
      <Switch />
      <Label>
        <Text>Airplane Mode</Text>
      </Label>
    </Container>
  );
}

export function SliderDemo() {
  return <Slider defaultValue={50} max={100} step={1} width="60%" />;
}

export function SkeletonDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={16}>
      <Skeleton borderRadius={1000} height={48} width={48} />
      <Container gap={8}>
        <Skeleton height={16} width={250} />
        <Skeleton height={16} width={200} />
      </Container>
    </Container>
  );
}

export function SeparatorDemo() {
  return (
    <Container>
      <Container gap={4}>
        <Text fontSize={14} lineHeight={1}>
          Radix Primitives
        </Text>
        <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
          An open-source UI component library.
        </Text>
      </Container>
      <Separator marginY={16} />
      <Container flexDirection="row" height={20} alignItems="center" gap={16}>
        <DefaultProperties fontSize={14} lineHeight={1.43}>
          <Text>Blog</Text>
          <Separator orientation="vertical" />
          <Text>Docs</Text>
          <Separator orientation="vertical" />
          <Text>Source</Text>
        </DefaultProperties>
      </Container>
    </Container>
  );
}

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <RadioGroupItem value="default">
        <Label>
          <Text>Default</Text>
        </Label>
      </RadioGroupItem>
      <RadioGroupItem value="comfortable">
        <Label>
          <Text>Comfortable</Text>
        </Label>
      </RadioGroupItem>
      <RadioGroupItem value="compact">
        <Label>
          <Text>Compact</Text>
        </Label>
      </RadioGroupItem>
    </RadioGroup>
  );
}

export function ProgressDemo() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} width="60%" />;
}

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            <Text>1</Text>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>
            <Text>2</Text>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            <Text>3</Text>
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function CheckboxDemo() {
  return (
    <Container flexDirection="row" gap={8} alignItems="center">
      <Checkbox />
      <Label>
        <Text>Accept terms and conditions</Text>
      </Label>
    </Container>
  );
}

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

export function CardDemo() {
  return (
    <Card width={380}>
      <CardHeader>
        <CardTitle>
          <Text>Notifications</Text>
        </CardTitle>
        <CardDescription>
          <Text>You have 3 unread messages.</Text>
        </CardDescription>
      </CardHeader>
      <CardContent flexDirection="column" gap={16}>
        <Container
          flexDirection="row"
          alignItems="center"
          gap={16}
          borderRadius={6}
          border={1}
          padding={16}
        >
          <BellRing />
          <Container gap={4}>
            <Text fontSize={14} lineHeight={1}>
              Push Notifications
            </Text>
            <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
              Send notifications to device.
            </Text>
          </Container>
        </Container>
        <Container>
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
              <Container gap={4}>
                <Text fontSize={14} lineHeight={1}>
                  {notification.title}
                </Text>
                <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
                  {notification.description}
                </Text>
              </Container>
            </Container>
          ))}
        </Container>
      </CardContent>
      <CardFooter>
        <Button flexDirection="row" width="100%">
          <Check marginRight={8} height={16} width={16} />
          <Text>Mark all as read</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ButtonDemo() {
  return (
    <Button variant="outline" size="icon">
      <ChevronRight width={16} height={16} />
    </Button>
  );
}

export function BadgeDemo() {
  return (
    <Badge>
      <Text>Badge</Text>
    </Badge>
  );
}

export function AvatarDemo() {
  return (
    <Container alignItems="center">
      <Avatar src="https://picsum.photos/100/100" />
    </Container>
  );
}

export function AlertDemo() {
  return (
    <Alert>
      <AlertIcon>
        <Terminal width={16} height={16} />
      </AlertIcon>
      <AlertTitle>
        <Text>Error</Text>
      </AlertTitle>
      <AlertDescription>
        <Text>You can add components to your app using the cli.</Text>
      </AlertDescription>
    </Alert>
  );
}

//TODO: type="single" collapsible
export function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Text>Is it accessible?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <Text>Is it styled?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>
            Yes. It comes with default styles that matches the other components&apos; aesthetic.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <Text>Is it animated?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Yes. It&apos;s animated by default, but you can disable it if you prefer.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
