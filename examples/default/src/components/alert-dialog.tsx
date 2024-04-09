import { Text } from '@react-three/uikit'
import { Button } from '@/button.js'
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
