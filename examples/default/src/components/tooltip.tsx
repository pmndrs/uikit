import { Text } from '@react-three/uikit'
import { Button } from '@/button.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/tooltip.js'

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline">
          <Text>Hover</Text>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Add to library</Text>
      </TooltipContent>
    </Tooltip>
  )
}
