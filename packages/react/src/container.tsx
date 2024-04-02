import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, AddScrollHandler } from './utilts.js'
import { ContainerProperties, createContainer, destroyContainer } from '@vanilla-three/uikit/internals'
import { useDefaultProperties } from './default.js'

export const Container: (
  props: {
    children?: ReactNode
  } & ContainerProperties &
    EventHandlers,
) => ReactNode = forwardRef((properties, ref) => {
  //TODO: ComponentInternals
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const defaultProperties = useDefaultProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const internals = useMemo(() => createContainer(parent, properties, defaultProperties, outerRef, innerRef), [parent])
  useEffect(() => () => destroyContainer(internals), [internals])

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
