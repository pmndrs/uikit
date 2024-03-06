import { Card } from '@/card'
import { Progress } from '@/progress'

export function ProgressBarsOnCard() {
  return (
    <Card width={200} borderRadius={32} padding={16} flexDirection="column" gapRow={16}>
      <Progress value={0} />
      <Progress value={0.25} />
      <Progress value={0.5} />
      <Progress value={0.75} />
      <Progress value={1} />
    </Card>
  )
}
