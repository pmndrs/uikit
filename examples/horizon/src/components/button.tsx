import { Button, ButtonIcon, ButtonLabel, ButtonLabelSubtext } from '@react-three/uikit-horizon'
import { Text } from '@react-three/uikit'
import { GithubIcon } from '@react-three/uikit-lucide'

export function ButtonDemo() {
  return (
    <Button>
      <ButtonIcon>
        <GithubIcon />
      </ButtonIcon>
      <ButtonLabel>
        <Text>Label</Text>
        <ButtonLabelSubtext>
          <Text>Subtext</Text>
        </ButtonLabelSubtext>
      </ButtonLabel>
    </Button>
  )
}
