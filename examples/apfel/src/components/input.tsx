import { Card } from '@/card.js'
import { Input } from '@/input.js'
import { useState } from 'react'

export function InputsOnCard() {
  const [text, setText] = useState('')
  return (
    <Card flexDirection="column" borderRadius={32} padding={16}>
      <Input value={text} onValueChange={setText} variant="rect" placeholder="Placeholder" />
    </Card>
  )
}
