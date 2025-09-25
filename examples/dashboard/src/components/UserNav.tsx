import { Avatar, DialogTrigger, VanillaDialog } from '@react-three/uikit-default'

export function UserNav({ dialog }: { dialog: VanillaDialog | null }) {
  return (
    <DialogTrigger dialog={dialog ?? undefined}>
      <Avatar cursor="pointer" src="/uikit/examples/dashboard/01.png" height={32} width={32} />
    </DialogTrigger>
  )
}
