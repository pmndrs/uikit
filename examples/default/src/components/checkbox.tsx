import { Text, Container } from '@react-three/uikit'
import { Label, Checkbox } from '@react-three/uikit-default'

export function CheckboxDemo() {
  return (
    <Container flexDirection="row" gap={8} alignItems="center">
      <Checkbox />
      <Label>
        <Text>Accept terms and conditions</Text>
      </Label>
    </Container>
  )
}
