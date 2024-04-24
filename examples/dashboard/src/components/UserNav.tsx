import { Text, Container } from '@react-three/uikit'
import { BellRing } from '@react-three/uikit-lucide'
import { Avatar } from '@/avatar.js'
import { Button } from '@/button.js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/dialog.js'
import { colors } from '@/theme.js'
import { Switch } from '@/switch.js'

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

export function UserNav({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Avatar cursor="pointer" src="/uikit/examples/dashboard/01.png" height={32} width={32} />
      </DialogTrigger>
      <DialogContent positionType="relative" transformTranslateZ={200} sm={{ maxWidth: 425 }}>
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
            <Text fontWeight="medium" fontSize={14} lineHeight={20} color={colors.mutedForeground}>
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
              <Container height={8} width={8} transformTranslateY={4} borderRadius={1000} backgroundColor={0x0ea5e9} />
              <Container flexDirection="column" gap={4}>
                <Text fontSize={14} lineHeight="100%">
                  {notification.title}
                </Text>
                <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
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
  )
}
