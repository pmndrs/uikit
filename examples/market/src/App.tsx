import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, TiltShift2 } from '@react-three/postprocessing'
import { Root, Container, Image, Text, Fullscreen, DefaultProperties } from '@react-three/uikit'
import { PlusCircle } from '@react-three/uikit-lucide'
import { Defaults, colors } from '@/theme.js'
import { DialogAnchor } from '@/dialog.js'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/tabs.js'
import { Separator } from '@/separator.js'
import { Button } from '@/button.js'
import { VideoContainer } from '@/video.js'
import { AlbumArtwork } from './components/album-artwork.js'
import { listenNowAlbums, madeForYouAlbums } from './data/albums.js'
import { Sidebar } from './components/sidebar.js'
import { playlists } from './data/playlists.js'
import { Menu } from './components/menu.js'

export default function App() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 18], fov: 35 }}
      style={{ height: '100dvh', touchAction: 'none' }}
      gl={{ localClippingEnabled: true }}
    >
      {/*<Root backgroundColor={0xffffff} sizeX={8.34} sizeY={5.58} pixelSize={0.01}>
        <Defaults>
          <DialogAnchor>
            <MarketPage />
          </DialogAnchor>
        </Defaults>
      </Root>
      <Environment background blur={1} preset="city" />
      <EffectComposer>
        <TiltShift2 blur={0.25} />
      </EffectComposer>
      <OrbitControls makeDefault />*/}
      <Fullscreen flexDirection="column">
        <Defaults>
          <DefaultProperties scrollbarWidth={8} scrollbarOpacity={0.1} scrollbarBorderRadius={4}>
            <MarketPage />
          </DefaultProperties>
        </Defaults>
      </Fullscreen>
    </Canvas>
  )
}

export function MarketPage() {
  return (
    <Container height="100%" flexDirection="column">
      <Menu />
      <Container flexBasis={0} flexGrow={1} borderTopWidth={1} backgroundColor={colors.background} flexDirection="row">
        <Sidebar marginTop={16} playlists={playlists} />
        <Separator orientation="vertical" />
        <Container
          marginTop={16}
          overflow="scroll"
          flexGrow={1}
          flexBasis={0}
          paddingX={16}
          paddingBottom={24}
          paddingTop={8}
          lg={{ paddingX: 32 }}
          flexDirection="column"
        >
          <Tabs defaultValue="music" height="100%" gap={24}>
            <Container flexShrink={0} flexDirection="row" justifyContent="space-between" alignItems="center">
              <TabsList>
                <TabsTrigger value="music">
                  <Text>Models</Text>
                </TabsTrigger>
                <TabsTrigger value="podcasts" disabled>
                  <Text>HDRIS</Text>
                </TabsTrigger>
                <TabsTrigger value="live" disabled>
                  <Text>Materials</Text>
                </TabsTrigger>
              </TabsList>
              <Button marginRight={16}>
                <PlusCircle marginRight={8} height={16} width={16} />
                <Text>Request Model</Text>
              </Button>
            </Container>
            <TabsContent flexShrink={0} flexDirection="column" value="music" borderWidth={0} padding={0}>
              <Container flexDirection="row" alignItems="center" justifyContent="space-between">
                <Container flexDirection="column" gap={4}>
                  <Text fontWeight="semi-bold" letterSpacing={-0.4} fontSize={18} lineHeight={28}>
                    Trending
                  </Text>
                  <Text color={colors.mutedForeground} fontSize={14} lineHeight={20}>
                    Top picks for you. Updated daily.
                  </Text>
                </Container>
              </Container>
              <Separator marginY={16} />
              <Container flexDirection="row" overflow="scroll" gap={16} paddingBottom={16}>
                {listenNowAlbums.map((album) => (
                  <AlbumArtwork key={album.name} album={album} width={250} height={330} aspectRatio="portrait" />
                ))}
              </Container>
              <Container flexDirection="column" marginTop={24} gap={4}>
                <Text fontWeight="semi-bold" letterSpacing={-0.4} fontSize={18} lineHeight={28}>
                  Made By You
                </Text>
                <Text color={colors.mutedForeground} fontSize={14} lineHeight={20}>
                  Your personal models.
                </Text>
              </Container>
              <Separator marginY={16} />
              <Container flexShrink={1} flexDirection="row" overflow="scroll" gap={16} paddingBottom={16}>
                <VideoContainer controls borderRadius={6} flexShrink={0} src="example.mp4" />
                {madeForYouAlbums.map((album) => (
                  <AlbumArtwork key={album.name} album={album} aspectRatio="square" width={150} height={150} />
                ))}
              </Container>
            </TabsContent>
          </Tabs>
        </Container>
      </Container>
    </Container>
  )
}
