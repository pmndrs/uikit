import { Text } from '@react-three/uikit'
import { RadioGroup, RadioGroupItem } from '@react-three/uikit-horizon'

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <RadioGroupItem value="default">
        <Text>Default</Text>
      </RadioGroupItem>
      <RadioGroupItem value="comfortable">
        <Text>Comfortable</Text>
      </RadioGroupItem>
      <RadioGroupItem value="compact">
        <Text>Compact</Text>
      </RadioGroupItem>
    </RadioGroup>
  )
}
