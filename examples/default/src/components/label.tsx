import { Text, Container } from '@react-three/uikit'
import { Checkbox, Label } from '@react-three/uikit-default'

export function LabelDemo() {
  return (
    <Container flexDirection="row" gap={8} alignItems="center">
      <Checkbox />
      <Label>
        <Text>Accept terms and conditions</Text>
      </Label>
    </Container>
  )
}
