import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { DefaultProperties, Fullscreen, Text, Container } from '@react-three/uikit'
import { BellRing, Bold, Check, ChevronRight, Italic, Terminal, Underline } from '@react-three/uikit-lucide'
import { Perf } from 'r3f-perf'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/accordion'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/alert'
import { DefaultColors, colors } from '@/theme'
import { Avatar } from '@/avatar'
import { Badge } from '@/badge'
import { Button } from '@/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/card'
import { Checkbox } from '@/checkbox'
import { Label } from '@/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/pagination'
import { Progress } from '@/progress'
import { RadioGroup, RadioGroupItem } from '@/radio-group'
import { Separator } from '@/separator'
import { Skeleton } from '@/skeleton'
import { Slider } from '@/slider'
import { Switch } from '@/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs'
import { Toggle } from '@/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/toggle-group'
import {
  Dialog,
  DialogAnchor,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useCloseDialog,
} from '@/dialog.js'
import { XWebPointers, noEvents } from '@coconut-xr/xinteraction/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/alert-dialog.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/tooltip.js'

export default function App() {
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <XWebPointers />
      <Perf />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen
        scrollbarColor="black"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        padding={32}
      >
        <DefaultColors>
          <DialogAnchor>
            <Container flexDirection="row" justifyContent="center" width="100%" maxWidth={500}>
              <TooltipDemo />
            </Container>
          </DialogAnchor>
        </DefaultColors>
      </Fullscreen>
    </Canvas>
  )
}

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline">
          <Text>Hover</Text>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Add to library</Text>
      </TooltipContent>
    </Tooltip>
  )
}

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="outline">
          <Text>Show Dialog</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Text>Are you absolutely sure?</Text>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Text>
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </Text>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <Text>Edit Profile</Text>
        </Button>
      </DialogTrigger>
      <DialogContent sm={{ maxWidth: 425 }}>
        <DialogHeader>
          <DialogTitle>
            <Text>Edit profile</Text>
          </DialogTitle>
          <DialogDescription>
            <Text>Make changes to your profile here. Click save when you're done.</Text>
          </DialogDescription>
        </DialogHeader>
        <Container gap={16} paddingY={16}>
          <Container alignItems="center" gap={16}>
            <Label>
              <Text horizontalAlign="right">Name</Text>
            </Label>
            {/*<Input defaultValue="Pedro Duarte" className="col-span-3" />*/}
          </Container>
          <Container alignItems="center" gap={16}>
            <Label>
              <Text horizontalAlign="right">Username</Text>
            </Label>
            {/*<Input id="username" defaultValue="@peduarte" className="col-span-3" />*/}
          </Container>
        </Container>
        <DialogFooter>
          <Button>
            <Text>Save changes</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToggleGroupDemo() {
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
  )
}

function ToggleDemo() {
  return (
    <Toggle>
      <Bold height={16} width={16} />
    </Toggle>
  )
}

function TabsDemo() {
  return (
    <Tabs defaultValue="account" width={400}>
      <TabsList width="100%">
        <TabsTrigger flexGrow={1} value="account">
          <Text>Account</Text>
        </TabsTrigger>
        <TabsTrigger flexGrow={1} value="password">
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
  )
}

function SwitchDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={8}>
      <Switch />
      <Label>
        <Text>Airplane Mode</Text>
      </Label>
    </Container>
  )
}

function SliderDemo() {
  return <Slider defaultValue={50} max={100} step={1} width="60%" />
}

function SkeletonDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={16}>
      <Skeleton borderRadius={1000} height={48} width={48} />
      <Container gap={8}>
        <Skeleton height={16} width={250} />
        <Skeleton height={16} width={200} />
      </Container>
    </Container>
  )
}

function SeparatorDemo() {
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
  )
}

function RadioGroupDemo() {
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
  )
}

function ProgressDemo() {
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return <Progress value={progress} width="60%" />
}

function PaginationDemo() {
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
  )
}

function CheckboxDemo() {
  return (
    <Container flexDirection="row" gap={8} alignItems="center">
      <Checkbox />
      <Label>
        <Text>Accept terms and conditions</Text>
      </Label>
    </Container>
  )
}

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

function CardDemo() {
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
        <Container flexDirection="row" alignItems="center" gap={16} borderRadius={6} border={1} padding={16}>
          <BellRing />
          <Container gap={4}>
            <Text fontSize={14} lineHeight={1}>
              Push Notifications
            </Text>
            <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
              Send notifications to device.
            </Text>
          </Container>
          <Switch />
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
              <Container height={8} width={8} transformTranslateY={4} borderRadius={1000} backgroundColor={0x0ea5e9} />
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
  )
}

function ButtonDemo() {
  return (
    <Button variant="outline" size="icon">
      <ChevronRight width={16} height={16} />
    </Button>
  )
}

function BadgeDemo() {
  return (
    <Badge>
      <Text>Badge</Text>
    </Badge>
  )
}

function AvatarDemo() {
  return (
    <Container alignItems="center">
      <Avatar src="https://picsum.photos/100/100" />
    </Container>
  )
}

function AlertDemo() {
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
  )
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
          <Text>Yes. It comes with default styles that matches the other components&apos; aesthetic.</Text>
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
  )
}
