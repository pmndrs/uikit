import { Card } from '@/card.js'
import { Checkbox } from '@/checkbox.js'

export function CheckboxOnCard() {
  return (
    <Card borderRadius={32} padding={16} flexDirection="column" gapRow={16}>
      <Checkbox disabled defaultSelected={false} />
      <Checkbox defaultSelected={true} />
    </Card>
  )
}
