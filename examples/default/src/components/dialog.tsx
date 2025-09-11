import { Text, Container } from '@react-three/uikit'
import {
  Button,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  VanillaDialog,
} from '@react-three/uikit-default'
import { useMemo } from 'react'
import { signal } from '@preact/signals-core'

export function DialogDemo() {
  const ref = useMemo(() => signal<VanillaDialog | undefined>(undefined), [])
  return (
    <>
      <DialogTrigger dialog={ref}>
        <Button variant="outline">
          <Text>Edit Profile</Text>
        </Button>
      </DialogTrigger>
      <Dialog ref={(dialog) => void (ref.value = dialog ?? undefined)}>
        <DialogContent sm={{ maxWidth: 425 }}>
          <DialogHeader>
            <DialogTitle>
              <Text>Edit profile</Text>
            </DialogTitle>
            <DialogDescription>
              <Text>Make changes to your profile here. Click save when you're done.</Text>
            </DialogDescription>
          </DialogHeader>
          <Container flexDirection="column" alignItems="center" gap={16} paddingY={16}>
            <Container alignItems="center" gap={16}>
              <Label>
                <Text textAlign="right">Name</Text>
              </Label>
              {/*<Input defaultValue="Pedro Duarte" className="col-span-3" />*/}
            </Container>
            <Container alignItems="center" gap={16}>
              <Label>
                <Text textAlign="right">Username</Text>
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
    </>
  )
}
