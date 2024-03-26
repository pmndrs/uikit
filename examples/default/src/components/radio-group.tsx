import { Text } from '@react-three/uikit'
import { Label } from '@/label.js'
import { RadioGroup, RadioGroupItem } from '@/radio-group.js'

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <RadioGroupItem value="default">
        <Label>
          <Text>Default</Text>
        </Label>
      </RadioGroupItem>
      <RadioGroupItem value="comfortable">
        <Label>
          <Text>Comfortable</Text>
        </Label>
      </RadioGroupItem>
      <RadioGroupItem value="compact">
        <Label>
          <Text>Compact</Text>
        </Label>
      </RadioGroupItem>
    </RadioGroup>
  )
}
