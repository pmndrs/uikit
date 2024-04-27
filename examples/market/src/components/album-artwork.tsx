import { Container, Text, Image } from '@react-three/uikit'
import { Album } from '../data/albums.js'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from '@/theme.js'

export function AlbumArtwork({
  album,
  aspectRatio = 'portrait',
  width,
  height,
  ...props
}: {
  album: Album
  aspectRatio?: 'portrait' | 'square'
} & Omit<ComponentPropsWithoutRef<typeof Container>, 'aspectRatio'>) {
  return (
    <Container flexShrink={0} flexDirection="column" gap={12} {...props}>
      <Image
        borderRadius={6}
        src={album.cover}
        width={width}
        height={height}
        objectFit="cover"
        aspectRatio={aspectRatio === 'portrait' ? 3 / 4 : 1}
      />
      <Container flexDirection="column" gap={4}>
        <Text fontWeight="medium" fontSize={14} lineHeight="100%">
          {album.name}
        </Text>
        <Text fontSize={12} lineHeight={16} color={colors.mutedForeground}>
          {album.artist}
        </Text>
      </Container>
    </Container>
  )
}
