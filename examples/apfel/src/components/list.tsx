import { Text, Container } from '@react-three/uikit'
import { BoxSelect, ChevronRight, Info } from '@react-three/uikit-lucide'
import { Card } from '@/card'
import { List, ListItem } from '@/list'
import { Button } from '@/button'

export function ListsOnCard() {
  return (
    <Container flexDirection="column" gapRow={32} alignItems="center">
      <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32}>
        <Card borderRadius={32} padding={16}>
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
        <Card borderRadius={32} padding={16}>
          <List type="plain" width={400}>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              subtitle={<Text>Subtitle</Text>}
              selected
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
      </Container>
      <Container flexDirection="column" md={{ flexDirection: 'row' }} gap={32}>
        <Card borderRadius={32} padding={16}>
          <List type="inset" width={400}>
            <ListItem
              isFirst
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}>
              <Text>Title</Text>
            </ListItem>
            <ListItem
              isLast
              subtitle={<Text>Subtitle</Text>}
              trailingAccessory={<ChevronRight height={18} width={18} opacity={0.3} />}
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
        <Card borderRadius={32} padding={16}>
          <List type="inset" width={400}>
            <ListItem
              isFirst
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
            <ListItem
              isLast
              subtitle={<Text>Subtitle</Text>}
              leadingAccessory={<BoxSelect height={16} width={16} />}
              trailingAccessory={
                <Button variant="icon" size="xs" platter>
                  <Info height={14} width={14} />
                </Button>
              }
            >
              <Text>Title</Text>
            </ListItem>
          </List>
        </Card>
      </Container>
    </Container>
  )
}
