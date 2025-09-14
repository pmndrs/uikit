import { Text, Container } from '@react-three/uikit'
import { Label, Switch } from '@react-three/uikit-default'

export function SwitchDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={8}>
      <Switch />
      <Label>
        <Text>Airplane Mode</Text>
      </Label>
    </Container>
  )
}
