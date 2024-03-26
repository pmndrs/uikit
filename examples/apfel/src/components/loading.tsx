import { Card } from '@/card.js'
import { Loading } from '@/loading.js'

export function LoadingSpinnersOnCard() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="row" gapColumn={16}>
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </Card>
  )
}
