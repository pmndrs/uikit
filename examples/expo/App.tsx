import { Canvas } from '@react-three/fiber/native'
import {
  Fullscreen,
  Container,
  Text,
  PlatformConstants,
  FontFamilyProvider,
  DefaultProperties,
} from '@react-three/uikit'
import { loadYoga } from 'yoga-layout/asmjs-async'
import { TextureLoader } from 'expo-three'
//@ts-ignore
import fontJson from './assets/inter-normal.json'
//@ts-ignore
import fontPath from './assets/inter-normal.png'
import { playlists } from './data/playlists'
import { PlusCircle } from '@react-three/uikit-lucide'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/tabs'
import { Separator } from '@/separator'
import { Button } from '@/button'
import { AlbumArtwork } from './components/album-artwork'
import { listenNowAlbums, madeForYouAlbums } from './data/albums'
import { Sidebar } from './components/sidebar'
import { Menu } from './components/menu'
import { Defaults, colors } from '@/theme'

PlatformConstants.TextureLoader = TextureLoader

export default function App() {
  return (
    <Canvas
      onCreated={(state) => {
        const _gl = state.gl.getContext()
        const pixelStorei = _gl.pixelStorei.bind(_gl)
        _gl.pixelStorei = function (...args) {
          const [parameter] = args
          switch (parameter) {
            case _gl.UNPACK_FLIP_Y_WEBGL:
              return pixelStorei(...args)
          }
        }
      }}
      gl={{ localClippingEnabled: true }}
    >
      <Fullscreen
        scrollbarColor="black"
        scrollbarWidth={10}
        scrollbarOpacity={0.5}
        loadYoga={loadYoga}
        paddingTop={30}
        gap={10}
        overflow="scroll"
      >
        <FontFamilyProvider
          inter={{
            normal: { url: fontPath, json: fontJson },
          }}
        >
          <Defaults>
            <DefaultProperties scrollbarWidth={8} scrollbarOpacity={0.1} scrollbarBorderRadius={4}>
              <MarketPage />
            </DefaultProperties>
          </Defaults>
        </FontFamilyProvider>
      </Fullscreen>
    </Canvas>
  )
}

export function MarketPage() {
  return (
    <Container height="100%" flexDirection="column">
      <Menu />
      <Container flexBasis={0} flexGrow={1} borderTop={1} backgroundColor={colors.background} flexDirection="row">
        <Container
          marginTop={16}
          overflow="scroll"
          flexGrow={1}
          flexBasis={0}
          paddingX={16}
          paddingBottom={24}
          paddingTop={8}
          lg={{ paddingX: 32 }}
        >
          <Tabs defaultValue="music" height="100%" gap={24}>
            <Container flexDirection="row" justifyContent="space-between" alignItems="center">
              <TabsList>
                <TabsTrigger value="music">
                  <Text>Models</Text>
                </TabsTrigger>
                <TabsTrigger value="podcasts" disabled>
                  <Text>HDRIS</Text>
                </TabsTrigger>
              </TabsList>
              <Container marginLeft="auto" marginRight={16}>
                <Button>
                  <PlusCircle marginRight={8} height={16} width={16} />
                  <Text>Request Model</Text>
                </Button>
              </Container>
            </Container>
            <TabsContent value="music" border={0} padding={0}>
              <Container flexDirection="row" alignItems="center" justifyContent="space-between">
                <Container gap={4}>
                  <Text fontWeight="semi-bold" letterSpacing={-0.4} fontSize={18} lineHeight={1.55555}>
                    Trending
                  </Text>
                  <Text color={colors.mutedForeground} fontSize={14} lineHeight={1.43333}>
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
              <Container marginTop={24} gap={4}>
                <Text fontWeight="semi-bold" letterSpacing={-0.4} fontSize={18} lineHeight={1.55555}>
                  Made By You
                </Text>
                <Text color={colors.mutedForeground} fontSize={14} lineHeight={1.43333}>
                  Your personal models.
                </Text>
              </Container>
              <Separator marginY={16} />
              <Container flexShrink={1} flexDirection="row" overflow="scroll" gap={16} paddingBottom={16}>
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
