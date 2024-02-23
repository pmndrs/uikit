import { Button } from '@/button.js'
import { Calendar } from '@react-three/uikit-lucide'
import { Text } from '@react-three/uikit'

export function CalendarDateRangePicker() {
  return (
    <Button variant="outline" width={260} justifyContent="flex-start">
      <Calendar marginRight={8} width={16} height={16} />
      <Text fontWeight="normal">Jan 20, 2023 - Feb 09, 2023</Text>
    </Button>
  )
}
