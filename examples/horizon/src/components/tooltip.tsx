import { Text } from '@react-three/uikit'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@react-three/uikit-default'

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
