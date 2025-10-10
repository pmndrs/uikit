import { Container, Text } from '@react-three/uikit'
import { Panel } from '@react-three/uikit-horizon'

export function PanelDemo() {
  return (
    <Panel padding={16} width={300}>
      <Container>
        <Text>Panel content</Text>
      </Container>
    </Panel>
  )
}


