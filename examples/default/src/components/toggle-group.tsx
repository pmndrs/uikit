import { Bold, Italic, Underline } from '@react-three/uikit-lucide'
import { ToggleGroup, ToggleGroupItem } from '@/toggle-group.js'

export function ToggleGroupDemo() {
  return (
    <ToggleGroup>
      <ToggleGroupItem aria-label="Toggle bold">
        <Bold height={16} width={16} />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic">
        <Italic height={16} width={16} />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline">
        <Underline width={16} height={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
