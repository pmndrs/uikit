import { ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react'
import { DEFAULT_PIXEL_SIZE, Root, RootProperties } from './root.js'
import { batch, signal } from '@preact/signals-core'
import { RootState, createPortal, useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Yoga } from 'yoga-layout/wasm-async'
import { ScrollListeners } from '../scroll.js'
import { ComponentInternals, LayoutListeners } from './utils.js'
import { Group, PerspectiveCamera } from 'three'

export const Fullscreen = forwardRef<
  ComponentInternals,
  RootProperties & {
    loadYoga?: () => Promise<Yoga>
    children?: ReactNode
    precision?: number
    attachCamera?: boolean
  } & EventHandlers &
    LayoutListeners &
    ScrollListeners
>((properties, ref) => {
  const store = useStore()
  const [sizeX, sizeY] = useMemo(() => {
    const { width, height } = store.getState().size
    return [signal(width * DEFAULT_PIXEL_SIZE), signal(height * DEFAULT_PIXEL_SIZE)] as const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const fn = (state: RootState) => {
      batch(() => {
        sizeX.value = state.size.width * DEFAULT_PIXEL_SIZE
        sizeY.value = state.size.height * DEFAULT_PIXEL_SIZE
      })
    }
    fn(store.getState())
    return store.subscribe(fn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])
  const camera = useThree((s) => s.camera)
  const groupRef = useRef<Group>(null)
  useFrame(() => {
    if (groupRef.current == null) {
      return
    }
    let distance = 1
    if (camera instanceof PerspectiveCamera) {
      distance = sizeY.peek() / (2 * Math.tan((camera.fov / 360) * Math.PI))
    }
    groupRef.current.position.z = -distance
    groupRef.current.updateMatrix()
  })
  const attachCamera = properties.attachCamera ?? true
  return (
    <>
      {attachCamera && <primitive object={camera} />}
      {createPortal(
        <group ref={groupRef} matrixAutoUpdate={false}>
          <Root ref={ref} {...properties} sizeX={sizeX} sizeY={sizeY}>
            {properties.children}
          </Root>
        </group>,
        camera,
      )}
    </>
  )
})
