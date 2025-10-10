import { Container, Text } from '@react-three/uikit'
import {
  Dropdown,
  DropdownAvatar,
  DropdownButton,
  DropdownIcon,
  DropdownList,
  DropdownListItem,
  DropdownTextValue,
} from '@react-three/uikit-horizon'

export function DropdownDemo() {
  return (
    <Container gap={8}>
      <Dropdown>
        <DropdownAvatar src="./avatar.png" />
        <DropdownTextValue placeholder="Select option" />
        <DropdownIcon />
        <DropdownButton />
        <DropdownList>
          <DropdownListItem value="Option A">
            <Text>Option A</Text>
          </DropdownListItem>
          <DropdownListItem value="Option B">
            <Text>Option B</Text>
          </DropdownListItem>
          <DropdownListItem value="Option C">
            <Text>Option C</Text>
          </DropdownListItem>
        </DropdownList>
      </Dropdown>
    </Container>
  )
}


