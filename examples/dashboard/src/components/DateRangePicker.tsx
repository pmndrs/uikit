import { Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'
import { Calendar } from '@react-three/uikit-lucide'

export function CalendarDateRangePicker() {
  return (
    <Button variant="outline" width={260} justifyContent="flex-start">
      <Calendar marginRight={8} width={16} height={16} />
      <Text fontWeight="normal">Jan 20, 2023 - Feb 09, 2023</Text>
    </Button>
  )
}
