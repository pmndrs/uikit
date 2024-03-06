import { Text } from '@react-three/uikit'
import { BoxSelect } from '@react-three/uikit-lucide'
import { TabBar, TabBarItem } from '@/tab-bar'

export function TabBarWithText() {
  return (
    <TabBar defaultValue="1">
      <TabBarItem value="1" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="2" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="3" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
      <TabBarItem value="4" icon={<BoxSelect />}>
        <Text>Label</Text>
      </TabBarItem>
    </TabBar>
  )
}
