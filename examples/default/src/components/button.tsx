import { ChevronRight } from '@react-three/uikit-lucide'
import { Button } from '@/button.js'

export function ButtonDemo() {
  return (
    <Button variant="outline" size="icon">
      <ChevronRight width={16} height={16} />
    </Button>
  )
}
