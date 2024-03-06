import { Text } from '@react-three/uikit'
import { Card } from '@/card'

export function TextOnCard() {
  return (
    <Card borderRadius={32} padding={32} gap={8} flexDirection="column">
      <Text fontSize={32}>Hello World!</Text>
      <Text fontSize={24} opacity={0.7}>
        This is the apfel kit.
      </Text>
    </Card>
  )
}
