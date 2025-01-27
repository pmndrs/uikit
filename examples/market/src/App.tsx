import { Canvas, useFrame } from '@react-three/fiber'
import { Container, Text, Fullscreen, DefaultProperties } from '@react-three/uikit'
import { CirclePlus } from '@react-three/uikit-lucide'
import { Defaults, colors } from '@/theme.js'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/tabs.js'
import { Separator } from '@/separator.js'
import { Button } from '@/button.js'
import { Video } from '@/video.js'
import { AlbumArtwork } from './components/album-artwork.js'
import { listenNowAlbums, madeForYouAlbums } from './data/albums.js'
import { Sidebar } from './components/sidebar.js'
import { playlists } from './data/playlists.js'
import { Menu } from './components/menu.js'
import { create } from 'zustand'
import { noEvents, PointerEvents } from '@react-three/xr'

export default function App() {
  return (
    <>
      <FrameCounter />
      <Canvas
        flat
        events={noEvents}
        frameloop="demand"
        camera={{ position: [0, 0, 18], fov: 35 }}
        style={{ height: '100dvh', touchAction: 'none' }}
        gl={{ localClippingEnabled: true }}
      >
        <PointerEvents />
        <CountFrames />
        <Fullscreen flexDirection="column">
          <Defaults>
            <DefaultProperties scrollbarWidth={8} scrollbarOpacity={0.1} scrollbarBorderRadius={4}>
              <MarketPage />
            </DefaultProperties>
          </Defaults>
        </Fullscreen>
      </Canvas>
    </>
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
                <CirclePlus marginRight={8} height={16} width={16} />
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
                <Video controls borderRadius={6} flexShrink={0} src="example.mp4" />
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

const useFrameCounter = create(() => 0)

function CountFrames() {
  useFrame(() => useFrameCounter.setState(useFrameCounter.getState() + 1))
  return null
}

function FrameCounter() {
  const counter = useFrameCounter()
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'black',
        fontSize: '2rem',
        padding: '0.5rem 1rem',
        color: 'white',
        fontFamily: 'sans-serif',
        zIndex: 100,
      }}
    >
      {counter}
    </div>
  )
}
