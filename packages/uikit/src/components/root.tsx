import { Yoga } from 'yoga-wasm-web'
import { ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react'
import { FlexNode, YogaProperties } from '../flex/node.js'
import { RootGroupProvider, alignmentXMap, alignmentYMap, useLoadYoga } from '../utils.js'
import {
  InstancedPanelProvider,
  InteractionGroup,
  MaterialClass,
  ShadowProperties,
  useGetInstancedPanelGroup,
  useInstancedPanel,
  useInteractionPanel,
  usePanelGroupDependencies,
} from '../panel/react.js'
import { WithReactive, createCollection, finalizeCollection, writeCollection } from '../properties/utils.js'
import { FlexProvider, useDeferredRequestLayoutCalculation } from '../flex/react.js'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ReadonlySignal, Signal, computed } from '@preact/signals-core'
import { Group, Matrix4, Plane, Vector2Tuple, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useApplyHoverProperties } from '../hover.js'
import {
  LayoutListeners,
  useLayoutListeners,
  MatrixProvider,
  ComponentInternals,
  useComponentInternals,
  WithConditionals,
} from './utils.js'
import { ClippingRectProvider, useClippingRect } from '../clipping.js'
import {
  ScrollGroup,
  ScrollHandler,
  ScrollListeners,
  ScrollbarProperties,
  useGlobalScrollMatrix,
  useScrollPosition,
  useScrollbars,
} from '../scroll.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { InstancedGlyphProvider, useGetInstancedGlyphGroup } from '../text/react.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { RootSizeProvider, useApplyResponsiveProperties } from '../responsive.js'
import { loadYogaFromGH } from '../flex/load-binary.js'
import { ElementType, OrderInfoProvider, patchRenderOrder, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'

export const DEFAULT_PRECISION = 0.1
export const DEFAULT_PIXEL_SIZE = 0.002

export function useRootLayout() {}

export type RootProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<Omit<YogaProperties, 'width' | 'height'> & TransformProperties & PanelProperties> &
        ScrollbarProperties
    >
  >
>

const planeHelper = new Plane()
const vectorHelper = new Vector3()

export const Root = forwardRef<
  ComponentInternals,
  RootProperties & {
    loadYoga?: () => Promise<Yoga>
    children?: ReactNode
    precision?: number
    anchorX?: keyof typeof alignmentXMap
    anchorY?: keyof typeof alignmentYMap
    pixelSize?: number
    backgroundMaterialClass?: MaterialClass
  } & WithReactive<{
      sizeX?: number
      sizeY?: number
    }> &
    EventHandlers &
    LayoutListeners &
    ScrollListeners &
    ShadowProperties
>((properties, ref) => {
  const collection = createCollection()
  const renderer = useThree((state) => state.gl)

  useEffect(() => patchRenderOrder(renderer), [renderer])
  const { sizeX, sizeY } = properties
  const [precision, pixelSize] = useMemo(
    () => [properties.precision ?? DEFAULT_PRECISION, properties.pixelSize ?? DEFAULT_PIXEL_SIZE],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const yoga = useLoadYoga(properties.loadYoga ?? loadYogaFromGH)
  const distanceToCameraRef = useMemo(() => ({ current: 0 }), [])
  const groupRef = useRef<Group>(null)
  const requestLayout = useDeferredRequestLayoutCalculation()
  const node = useMemo(
    () => new FlexNode(groupRef, distanceToCameraRef, yoga, precision, pixelSize, requestLayout, undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestLayout, groupRef, yoga],
  )
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  useEffect(() => () => node.destroy(), [node])

  const transformMatrix = useTransformMatrix(collection, node)

  const groupsContainer = useMemo(() => {
    const result = new Group()
    result.matrixAutoUpdate = false
    return result
  }, [])
  const getPanelGroup = useGetInstancedPanelGroup(pixelSize, node.cameraDistance, groupsContainer)
  const getGylphGroup = useGetInstancedGlyphGroup(pixelSize, node.cameraDistance, groupsContainer)

  const groupDeps = usePanelGroupDependencies(properties.backgroundMaterialClass, properties)
  const orderInfo = useOrderInfo(ElementType.Panel, undefined, groupDeps)

  const rootMatrix = useRootMatrix(transformMatrix, node.size, pixelSize, properties)
  const scrollPosition = useScrollPosition()
  const globalScrollMatrix = useGlobalScrollMatrix(scrollPosition, node, rootMatrix)
  useScrollbars(
    collection,
    scrollPosition,
    node,
    rootMatrix,
    undefined,
    properties.scrollbarMaterialClass,
    undefined,
    orderInfo,
    getPanelGroup,
  )

  useInstancedPanel(
    collection,
    rootMatrix,
    node.size,
    undefined,
    node.borderInset,
    undefined,
    orderInfo,
    undefined,
    groupDeps,
    panelAliasPropertyTransformation,
    getPanelGroup,
  )

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties, node.size)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  writeCollection(collection, 'width', useDivide(sizeX, pixelSize))
  writeCollection(collection, 'height', useDivide(sizeY, pixelSize))
  finalizeCollection(collection)

  const clippingRect = useClippingRect(rootMatrix, node.size, node.borderInset, node.overflow, node, undefined)
  useLayoutListeners(properties, node.size)

  const internactionPanel = useInteractionPanel(node.size, node, orderInfo, groupRef)

  useComponentInternals(ref, node, internactionPanel, scrollPosition)

  useFrame(({ camera }) => {
    planeHelper.normal.set(0, 0, 1)
    planeHelper.constant = 0
    planeHelper.applyMatrix4(internactionPanel.matrixWorld)
    vectorHelper.setFromMatrixPosition(camera.matrixWorld)
    distanceToCameraRef.current = planeHelper.distanceToPoint(vectorHelper)
  })

  return (
    <>
      <primitive object={groupsContainer} />
      <InteractionGroup groupRef={groupRef} matrix={rootMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
        <RootGroupProvider value={groupRef}>
          <InstancedGlyphProvider value={getGylphGroup}>
            <InstancedPanelProvider value={getPanelGroup}>
              <ScrollHandler node={node} scrollPosition={scrollPosition} listeners={properties}>
                <primitive object={internactionPanel} />
              </ScrollHandler>
              <ScrollGroup node={node} scrollPosition={scrollPosition}>
                <MatrixProvider value={globalScrollMatrix}>
                  <FlexProvider value={node}>
                    <ClippingRectProvider value={clippingRect}>
                      <OrderInfoProvider value={orderInfo}>
                        <RootSizeProvider value={node.size}>{properties.children}</RootSizeProvider>
                      </OrderInfoProvider>
                    </ClippingRectProvider>
                  </FlexProvider>
                </MatrixProvider>
              </ScrollGroup>
            </InstancedPanelProvider>
          </InstancedGlyphProvider>
        </RootGroupProvider>
      </InteractionGroup>
    </>
  )
})

function useDivide(
  size: number | Signal<number | undefined | null> | undefined,
  pixelSize: number,
): ReadonlySignal<number | undefined> | number | undefined {
  return useMemo(
    () =>
      size === undefined
        ? undefined
        : size instanceof Signal
          ? computed(() => {
              const s = size.value
              if (s == null) {
                return undefined
              }
              return s / pixelSize
            })
          : size / pixelSize,
    [size, pixelSize],
  )
}

const matrixHelper = new Matrix4()

function useRootMatrix(
  matrix: Signal<Matrix4>,
  size: Signal<Vector2Tuple>,
  pixelSize: number,
  {
    anchorX = 'center',
    anchorY = 'center',
  }: {
    anchorX?: keyof typeof alignmentXMap
    anchorY?: keyof typeof alignmentYMap
  },
) {
  return useMemo(
    () =>
      computed(() => {
        const [width, height] = size.value
        return matrix.value
          .clone()
          .premultiply(
            matrixHelper.makeTranslation(
              alignmentXMap[anchorX] * width * pixelSize,
              alignmentYMap[anchorY] * height * pixelSize,
              0,
            ),
          )
      }),
    [matrix, size, anchorX, anchorY, pixelSize],
  )
}
