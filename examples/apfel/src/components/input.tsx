import { Card } from '@/card'
import { Input } from '@/input'
import { Container } from '@react-three/uikit'
import { BoxSelect } from '@react-three/uikit-lucide'
import { useState } from 'react'

export function InputsOnCard() {
  const [text, setText] = useState('')
  return (
    <Card flexDirection="column" borderRadius={32} padding={16}>
      <Container flexDirection="row" gapColumn={16}>
        <Container flexDirection="column" alignItems="stretch" gapRow={16} width={300}>
          <Input value={text} onValueChange={setText} variant="rect" placeholder="Placeholder" />
          <Input value={text} onValueChange={setText} variant="rect" placeholder="Placeholder" prefix={<BoxSelect />} />
          <Input value={text} onValueChange={setText} variant="rect" placeholder="Placeholder" disabled />
          <Input
            value={text}
            onValueChange={setText}
            variant="rect"
            placeholder="Placeholder"
            disabled
            prefix={<BoxSelect />}
          />
        </Container>
        <Container flexDirection="column" alignItems="stretch" gapRow={16} width={300}>
          <Input value={text} onValueChange={setText} variant="pill" placeholder="Placeholder" />
          <Input value={text} onValueChange={setText} variant="pill" placeholder="Placeholder" prefix={<BoxSelect />} />
          <Input value={text} onValueChange={setText} variant="pill" placeholder="Placeholder" disabled />
          <Input
            value={text}
            onValueChange={setText}
            variant="pill"
            placeholder="Placeholder"
            disabled
            prefix={<BoxSelect />}
          />
        </Container>
      </Container>
    </Card>
  )
}
