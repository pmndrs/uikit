import { useFrame, useStore, useThree } from '@react-three/fiber'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { ParentProvider } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  DEFAULT_PIXEL_SIZE,
  RootProperties as BaseRootProperties,
  WithReactive,
  readReactive,
  reversePainterSortStable,
  createRootState,
  setupRoot,
} from '@pmndrs/uikit/internals'
import { Object3D } from 'three'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { Signal, computed, signal } from '@preact/signals-core'
import { DefaultProperties } from './default.js'

export type RootProperties = BaseRootProperties<R3FEventMap> &
  WithReactive<{ pixelSize?: number }> & {
    children?: ReactNode
    name?: string
  }

export type RootRef = ComponentInternals<BaseRootProperties<R3FEventMap>>

export const Root: (props: RootProperties & RefAttributes<RootRef>) => ReactNode = forwardRef((properties, ref) => {
  const renderer = useThree((state) => state.gl)
  renderer.setTransparentSort(reversePainterSortStable)
  const store = useStore()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const pixelSizeSignal = useMemo(() => signal<Signal<number | undefined> | number | undefined>(undefined), [])
  pixelSizeSignal.value = properties.pixelSize
  const propertySignals = usePropertySignals(properties)
  const onFrameSet = useMemo(() => new Set<(delta: number) => void>(), [])
  const whileOnFrameRef = useRef(false)
  const invalidate = useThree((s) => s.invalidate)
  const internals = useMemo(
    () =>
      createRootState<R3FEventMap>(
        outerRef,
        computed(() => readReactive(pixelSizeSignal.value) ?? DEFAULT_PIXEL_SIZE),
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        () => store.getState().camera,
        renderer,
        onFrameSet,
        () => {
          if (whileOnFrameRef.current) {
            //request render unnecassary -> already rendering
            return
          }
          //not rendering -> requesting a new frame
          invalidate()
        },
        //requestFrame = invalidate, because invalidate always causes another frame
        invalidate,
      ),
    [invalidate, onFrameSet, pixelSizeSignal, propertySignals, renderer, store],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    if (outerRef.current == null || innerRef.current == null) {
      return
    }
    const abortController = new AbortController()
    setupRoot<R3FEventMap>(
      internals,
      propertySignals.style,
      propertySignals.properties,
      outerRef.current,
      innerRef.current,
      abortController.signal,
    )
    return () => abortController.abort()
  }, [propertySignals, internals])

  useFrame((_, delta) => {
    whileOnFrameRef.current = true
    for (const onFrame of onFrameSet) {
      //delta must be provided in milliseconds, therefore multiply by 1000
      onFrame(delta * 1000)
    }
    whileOnFrameRef.current = false
  })

  useComponentInternals(ref, internals.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <DefaultProperties {...internals.defaultProperties}>
          <ParentProvider value={internals}>{properties.children}</ParentProvider>
        </DefaultProperties>
      </object3D>
    </AddHandlers>
  )
})
