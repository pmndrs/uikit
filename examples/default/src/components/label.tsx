import { Text, Container } from '@react-three/uikit'
import { Checkbox } from '@/checkbox'
import { Label } from '@/label'

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
