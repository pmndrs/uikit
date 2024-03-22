import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context'
import { AddHandlers, AddScrollHandler } from './utilts'
import {
  createInteractionPanel,
  updateContainerProperties,
  ContainerProperties,
  createContainerState,
  cleanContainerState,
  createContainerContext,
} from '@vanilla-three/uikit/internals'
import { useDefaultProperties } from './default'

export const Container: (
  props: {
    children?: ReactNode
  } & ContainerProperties &
    EventHandlers,
) => ReactNode = forwardRef((properties, ref) => {
  //TODO: ComponentInternals
  const parent = useParent()
  const state = useMemo(() => createContainerState(parent.root.node.size), [parent])
  useEffect(() => () => cleanContainerState(state), [state])

  const defaultProperties = useDefaultProperties()
  const handlers = updateContainerProperties(state, properties, defaultProperties)

  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const ctx = useMemo(() => createContainerContext(state, outerRef, innerRef, parent), [parent, state])

  //TBD: useComponentInternals(ref, node, interactionPanel, scrollPosition)

  const interactionPanel = useMemo(() => createInteractionPanel(ctx, parent, state.subscriptions), [ctx, parent, state])

  return (
    <AddHandlers handlers={handlers} ref={outerRef}>
      <AddScrollHandler handlers={state.scrollHandlers}>
        <primitive object={interactionPanel} />
      </AddScrollHandler>
      <object3D ref={innerRef}>
        <ParentProvider value={ctx}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
