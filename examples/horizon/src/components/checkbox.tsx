import { Container, Text } from '@react-three/uikit'
import { Checkbox } from '@react-three/uikit-horizon'

export function CheckboxDemo() {
  return (
    <Container flexDirection="row" gap={8} alignItems="center">
      <Checkbox />
      <Text>Accept terms and conditions</Text>
    </Container>
  )
}
