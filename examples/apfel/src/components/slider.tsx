import { Container } from '@react-three/uikit'
import { BoxSelect } from '@react-three/uikit-lucide'
import { Card } from '@/card.js'
import { Slider } from '@/slider.js'

export function SlidersOnCard() {
  return (
    <Card
      borderRadius={32}
      padding={16}
      flexDirection="column"
      md={{ flexDirection: 'row' }}
      gapColumn={16}
      gapRow={32}
    >
      <Container flexDirection="column" gapRow={16} width={250}>
        <Slider size="xs" defaultValue={25} />
        <Slider size="sm" defaultValue={50} />
        <Slider size="md" defaultValue={75} icon={<BoxSelect />} />
        <Slider size="lg" defaultValue={100} icon={<BoxSelect />} />
      </Container>
    </Card>
  )
}
