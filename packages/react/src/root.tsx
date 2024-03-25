import { useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { ParentProvider } from './context'
import { AddHandlers, AddScrollHandler } from './utilts'
import { RootProperties, patchRenderOrder, createRoot, destroyRoot } from '@vanilla-three/uikit/internals'
import { useDefaultProperties } from './default'
import { Object3D } from 'three'

export const Root: (
  props: RootProperties & {
    children?: ReactNode
  } & EventHandlers,
) => ReactNode = forwardRef((properties, ref) => {
  const renderer = useThree((state) => state.gl)

  useEffect(() => patchRenderOrder(renderer), [renderer])
  const store = useStore()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const defaultProperties = useDefaultProperties()
  const internals = useMemo(
    () => createRoot(properties, defaultProperties, outerRef, innerRef, () => store.getState().camera),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store],
  )
  useEffect(() => () => destroyRoot(internals), [internals])

  useFrame((_, delta) => {
    for (const onFrame of internals.onFrameSet) {
      onFrame(delta)
    }
  })

  //TBD: useComponentInternals(ref, node, interactionPanel, scrollPosition)

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <AddScrollHandler handlers={internals.scrollHandlers}>
        <primitive object={internals.interactionPanel} />
      </AddScrollHandler>
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
