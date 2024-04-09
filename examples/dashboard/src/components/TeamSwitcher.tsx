import { ComponentPropsWithoutRef } from 'react'
import { Text } from '@react-three/uikit'
import { ChevronDown } from '@react-three/uikit-lucide'
import { Button } from '@/button.js'
import { Avatar } from '@/avatar.js'

const groups = [
  {
    label: 'Personal Account',
    teams: [
      {
        label: 'Alicia Koch',
        value: 'personal',
      },
    ],
  },
  {
    label: 'Teams',
    teams: [
      {
        label: 'Acme Inc.',
        value: 'acme-inc',
      },
      {
        label: 'Monsters Inc.',
        value: 'monsters',
      },
    ],
  },
]

export function TeamSwitcher(props: Omit<ComponentPropsWithoutRef<typeof Button>, 'children'>) {
  const selectedTeam = groups[0].teams[0]
  return (
    <Button variant="outline" width={200} justifyContent="space-between" {...props}>
      <Avatar marginRight={8} height={20} width={20} src={`/uikit/examples/dashboard/${selectedTeam.value}.png`} />
      <Text>{selectedTeam.label}</Text>
      <ChevronDown marginLeft="auto" height={20} width={20} flexShrink={0} opacity={0.5} />
    </Button>
  )
}
