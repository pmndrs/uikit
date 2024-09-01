import { Text, Container } from '@react-three/uikit'
import { BoxSelect, ChevronRight, Info } from '@react-three/uikit-lucide'
import { Card } from '@/card.js'
import { List, ListItem } from '@/list.js'
import { Button } from '@/button.js'

export function ListsOnCard() {
  return (
    <Container flexDirection="column" gapRow={32} alignItems="center">
      <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32}>
        <Card flexDirection="column" borderRadius={32} padding={16}>
          <List type="plain" width={400}>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}>
              <Text>Title</Text>
            </ListItem>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              selected
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
      </Container>
    </Container>
  )
}
