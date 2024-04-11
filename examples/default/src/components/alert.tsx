import { Text } from '@react-three/uikit'
import { Terminal } from '@react-three/uikit-lucide'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/alert.js'

export function AlertDemo() {
  return (
    <Alert maxWidth={500}>
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
