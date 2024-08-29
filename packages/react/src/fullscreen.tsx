import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Root } from './root.js'
import { batch, signal } from '@preact/signals-core'
import { createPortal, useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import {
  FullscreenProperties as BaseFullscreenProperties,
  PointerEventsProperties,
  RootProperties,
  updateSizeFullscreen,
} from '@pmndrs/uikit/internals'
import { ComponentInternals } from './ref.js'

export type FullscreenProperties = BaseFullscreenProperties & {
  children?: ReactNode
  attachCamera?: boolean
  distanceToCamera?: number
} & EventHandlers &
  PointerEventsProperties

export const Fullscreen: (
  props: FullscreenProperties & RefAttributes<ComponentInternals<RootProperties & EventHandlers>>,
) => ReactNode = forwardRef((properties, ref) => {
  const store = useStore()
  const camera = useThree((s) => s.camera)
  const distanceToCamera = properties.distanceToCamera ?? camera.near + 0.1
  const [sizeX, sizeY, pixelSize] = useMemo(() => {
    const sizeX = signal(1)
    const sizeY = signal(1)
    const pixelSize = signal(1)
    updateSizeFullscreen(sizeX, sizeY, pixelSize, distanceToCamera, camera, store.getState().size.height)
    return [sizeX, sizeY, pixelSize]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const hasAttached = useRef(false)
  useFrame(({ camera, scene, size: { height } }) => {
    batch(() => updateSizeFullscreen(sizeX, sizeY, pixelSize, distanceToCamera, camera, height))
    //attach camera to something so we can see the camera
    if (camera.parent == null && (properties.attachCamera ?? true)) {
      scene.add(camera)
      hasAttached.current = true
    }
  })
  //cleanup attaching the camera
  useEffect(
    () => () => {
      if (!hasAttached.current) {
        return
      }
      const { camera, scene } = store.getState()
      if (camera.parent != scene) {
        return
      }
      scene.remove(camera)
    },
    [store],
  )
  return createPortal(
    <group position-z={-distanceToCamera}>
      <Root ref={ref} {...properties} sizeX={sizeX} sizeY={sizeY} pixelSize={pixelSize}>
        {properties.children}
      </Root>
    </group>,
    camera,
  )
})
