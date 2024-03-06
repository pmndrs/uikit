import { Text } from '@react-three/uikit'
import { BoxSelect } from '@react-three/uikit-lucide'
import { Card } from '@/card'
import { Tabs, TabsButton } from '@/tabs'

export function TabsOnCard() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="column" alignItems="flex-start" gapRow={16}>
      <Tabs defaultValue="1">
        <TabsButton value="1">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4">
          <Text>Long Label</Text>
        </TabsButton>
        <TabsButton value="5" disabled>
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
      <Tabs defaultValue="1">
        <TabsButton value="1">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <BoxSelect height={12} width={12} />
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4" disabled>
          <BoxSelect height={12} width={12} />
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
      <Tabs defaultValue="1" disabled>
        <TabsButton value="1">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="2">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="3">
          <Text>Label</Text>
        </TabsButton>
        <TabsButton value="4">
          <Text>Long Label</Text>
        </TabsButton>
        <TabsButton value="5" disabled>
          <Text>Disabled</Text>
        </TabsButton>
      </Tabs>
    </Card>
  )
}
