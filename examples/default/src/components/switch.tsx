import { Text, Container } from '@react-three/uikit'
import { Label } from '@/label.js'
import { Switch } from '@/switch.js'

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
