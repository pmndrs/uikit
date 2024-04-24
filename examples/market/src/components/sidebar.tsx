import { Container, Text } from '@react-three/uikit'
import { Button } from '@/button.js'
import { Playlist } from '../data/playlists.js'
import { ComponentPropsWithoutRef } from 'react'
import { Eclipse, Package, Star, User, Image as ImageIcon } from '@react-three/uikit-lucide'

export function Sidebar({
  playlists,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  playlists: Playlist[]
}) {
  return (
    <Container flexDirection="column" overflow="scroll" paddingRight={20} paddingBottom={48} {...props}>
      <Container flexShrink={0} flexDirection="column" paddingBottom={16} gap={16}>
        <Container flexDirection="column" paddingX={12} paddingY={8}>
          <Text
            marginBottom={8}
            paddingX={16}
            fontWeight="semi-bold"
            fontSize={18}
            lineHeight={28}
            letterSpacing={-0.4}
          >
            Discover
          </Text>
          <Container flexDirection="column" gap={4}>
            <Button variant="secondary" justifyContent="flex-start">
              <Package marginRight={8} width={16} height={16} />
              <Text>Models</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <Eclipse marginRight={8} width={16} height={16} />
              <Text>Materials</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <ImageIcon marginRight={8} width={16} height={16} />
              <Text>HDRIS</Text>
            </Button>
          </Container>
        </Container>
        <Container flexDirection="column" paddingX={12} paddingY={8}>
          <Text
            marginBottom={8}
            paddingX={16}
            fontWeight="semi-bold"
            fontSize={18}
            lineHeight={28}
            letterSpacing={-0.4}
          >
            Collections
          </Text>
          <Container flexDirection="column" gap={4}>
            <Button variant="ghost" justifyContent="flex-start">
              <Star marginRight={8} width={16} height={16} />
              <Text>Favorits</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <Package marginRight={8} width={16} height={16} />
              <Text>Models</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <Eclipse marginRight={8} width={16} height={16} />
              <Text>Materials</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <ImageIcon marginRight={8} width={16} height={16} />
              <Text>HDRIs</Text>
            </Button>
            <Button variant="ghost" justifyContent="flex-start">
              <User marginRight={8} width={16} height={16} />
              <Text>Creators</Text>
            </Button>
          </Container>
        </Container>
        <Container flexDirection="column" paddingY={8}>
          <Text paddingX={28} fontSize={18} lineHeight={28} fontWeight="semi-bold" letterSpacing={-0.4}>
            Favorits
          </Text>
          <Container paddingX={4} flexDirection="column" gap={4} padding={8}>
            {playlists?.map((playlist, i) => (
              <Button key={`${playlist}-${i}`} variant="ghost" justifyContent="flex-start">
                <Star marginRight={8} width={16} height={16} />
                <Text fontWeight="normal">{playlist}</Text>
              </Button>
            ))}
          </Container>
        </Container>
      </Container>
    </Container>
  )
}
