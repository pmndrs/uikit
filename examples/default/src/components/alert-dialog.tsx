import { signal } from '@preact/signals-core'
import { Text } from '@react-three/uikit'
import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  VanillaDialog,
} from '@react-three/uikit-default'
import { useMemo } from 'react'

export function AlertDialogDemo() {
  const ref = useMemo(() => signal<VanillaDialog | undefined>(undefined), [])
  return (
    <>
      <AlertDialogTrigger dialog={ref}>
        <Button variant="outline">
          <Text>Show Dialog</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialog ref={(dialog) => void (ref.value = dialog ?? undefined)}>
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
    </>
  )
}
