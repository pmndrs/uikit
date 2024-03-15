import { Text, Container } from '@react-three/uikit'
import { Button } from '@/button'
import { Label } from '@/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/dialog'

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
