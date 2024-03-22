import { signal } from '@preact/signals-core'
import {
  createListeners,
  computeTextureAspectRatio,
  EventHandlers,
  createImagePropertyTransformers,
  createImage,
  createImageMesh,
  loadImageTexture,
  updateImageProperties,
  updateListeners,
  ImageProperties,
  Subscriptions,
  unsubscribeSubscriptions,
} from '@vanilla-three/uikit/internals'
import { ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D, Texture } from 'three'
import { AddHandlers, AddScrollHandler } from './utilts'
import { ParentProvider, useParent } from './context'
import { useDefaultProperties } from './default'

export const Image: (props: ImageProperties & { children?: ReactNode }) => ReactNode = forwardRef((properties, ref) => {
  const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
  const imageSubscriptions = useMemo<Subscriptions>(() => [], [])
  const srcRef = useRef<ImageProperties['src'] | undefined>(undefined)
  if (properties.src != srcRef.current) {
    unsubscribeSubscriptions(imageSubscriptions)
    loadImageTexture(texture, properties.src, imageSubscriptions)
    srcRef.current = properties.src
  }

  const scrollHandlers = useMemo(() => signal<EventHandlers>({}), [])
  const parent = useParent()
  const hoveredSignal = useMemo(() => signal<Array<number>>([]), [])
  const activeSignal = useMemo(() => signal<Array<number>>([]), [])
  const tranformers = useMemo(
    () => createImagePropertyTransformers(parent.root.node.size, hoveredSignal, activeSignal),
    [activeSignal, hoveredSignal, parent],
  )
  const propertiesSignal = useMemo(() => signal(undefined as any), [])
  const defaultProperties = useDefaultProperties()
  const propertySubscriptions = useMemo<Subscriptions>(() => [], [])
  const textureAspectRatio = useMemo(() => computeTextureAspectRatio(texture), [texture])
  unsubscribeSubscriptions(propertySubscriptions)
  const handlers = updateImageProperties(
    propertiesSignal,
    textureAspectRatio,
    properties,
    defaultProperties,
    hoveredSignal,
    activeSignal,
    tranformers,
    propertySubscriptions,
  )

  const listeners = useMemo(() => createListeners(), [])
  updateListeners(listeners, properties)

  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const subscriptions = useMemo<Subscriptions>(() => [], [])
  const ctx = useMemo(
    () => createImage(propertiesSignal, outerRef, innerRef, parent, scrollHandlers, listeners, subscriptions),
    [listeners, parent, propertiesSignal, scrollHandlers, subscriptions],
  )

  const mesh = useMemo(
    () => createImageMesh(propertiesSignal, texture, parent, ctx, subscriptions),
    [ctx, parent, propertiesSignal, subscriptions, texture],
  )

  useEffect(
    () => () => {
      unsubscribeSubscriptions(imageSubscriptions)
      unsubscribeSubscriptions(propertySubscriptions)
      unsubscribeSubscriptions(subscriptions)
    },
    [imageSubscriptions, propertySubscriptions, subscriptions],
  )

  return (
    <AddHandlers ref={outerRef} handlers={handlers}>
      <AddScrollHandler handlers={scrollHandlers}>
        <primitive object={mesh} />
      </AddScrollHandler>
      <object3D ref={innerRef}>
        <ParentProvider value={ctx}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
