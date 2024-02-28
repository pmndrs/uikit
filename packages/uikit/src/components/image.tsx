import { Group, Mesh, SRGBColorSpace, Texture, TextureLoader, Vector2Tuple } from 'three'
import { forwardRef, useMemo, useRef } from 'react'
import { useResourceWithParams, useRootGroupRef, useSignalEffect } from '../utils.js'
import { Signal, computed } from '@preact/signals-core'
import { Inset, YogaProperties } from '../flex/node.js'
import { panelGeometry } from '../panel/utils.js'
import { InteractionGroup, MaterialClass, ShadowProperties, usePanelMaterials } from '../panel/react.js'
import { useFlexNode } from '../flex/react.js'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { useApplyHoverProperties } from '../hover.js'
import {
  ComponentInternals,
  LayoutListeners,
  ViewportListeners,
  WithConditionals,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from './utils.js'
import { useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from '../clipping.js'
import { makeClippedRaycast, makePanelRaycast } from '../panel/interaction-panel-mesh.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import {
  ManagerCollection,
  PropertyTransformation,
  WithReactive,
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from '../properties/utils.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { ElementType, ZIndexOffset, setupRenderOrder, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'

export type ImageFit = 'cover' | 'fill'
const FIT_DEFAULT: ImageFit = 'fill'

export type ImageProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> & {
            opacity?: number
          } & TransformProperties &
          ImageFitProperties
      >
    >
  >
>

export type ImageFitProperties = {
  fit?: ImageFit
}

const materialPropertyTransformation: PropertyTransformation = (key, value, hasProperty, setProperty) => {
  if (key === 'opacity') {
    setProperty('backgroundOpacity', value)
    return
  }
  panelAliasPropertyTransformation(key, value, hasProperty, setProperty)
}

export const Image = forwardRef<
  ComponentInternals,
  ImageProperties & {
    src?: string | Signal<string> | Texture | Signal<Texture | undefined>
    materialClass?: MaterialClass
    zIndexOffset?: ZIndexOffset
  } & EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ShadowProperties
>((properties, ref) => {
  const collection = createCollection()
  const texture = useResourceWithParams(loadTexture, properties.src)
  const aspectRatio = useMemo(
    () =>
      computed(() => {
        const tex = texture.value
        if (tex == null) {
          return undefined
        }
        const image = tex.source.data as { width: number; height: number }
        return image.width / image.height
      }),
    [texture],
  )
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  useTextureFit(collection, texture, node.borderInset, node.size)
  const transformMatrix = useTransformMatrix(collection, node)
  const parentClippingRect = useParentClippingRect()
  const rootGroupRef = useRootGroupRef()
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroupRef)
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  const materials = usePanelMaterials(
    collection,
    node.size,
    node.borderInset,
    isClipped,
    properties.materialClass,
    clippingPlanes,
    materialPropertyTransformation,
  )
  const orderInfo = useOrderInfo(ElementType.Image, properties.zIndexOffset, undefined)
  const mesh = useMemo(() => {
    const [material, depthMaterial, distanceMaterial] = materials
    const result = new Mesh(panelGeometry, material)
    result.matrixAutoUpdate = false
    result.castShadow = properties.castShadow ?? false
    result.receiveShadow = properties.receiveShadow ?? false
    result.customDepthMaterial = depthMaterial
    result.customDistanceMaterial = distanceMaterial
    result.raycast = makeClippedRaycast(result, makePanelRaycast(result), rootGroupRef, parentClippingRect, orderInfo)
    setupRenderOrder(result, node.cameraDistance, orderInfo)
    return result
  }, [node, materials, rootGroupRef, parentClippingRect, orderInfo, properties.receiveShadow, properties.castShadow])

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  writeCollection(collection, 'backgroundColor', 0xffffff)
  writeCollection(collection, 'aspectRatio', aspectRatio)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  useSignalEffect(() => {
    const map = texture.value ?? null
    if ((mesh.material as any).map === map) {
      return
    }
    ;(mesh.material as any).map = map
    mesh.material.needsUpdate = true
  }, [mesh, texture])

  useSignalEffect(() => {
    const [width, height] = node.size.value
    mesh.scale.set(width * node.pixelSize, height * node.pixelSize, 1)
    mesh.updateMatrix()
  }, [mesh])

  useSignalEffect(() => void (mesh.visible = !isClipped.value), [mesh, isClipped])

  useComponentInternals(ref, node, mesh)

  return (
    <InteractionGroup groupRef={groupRef} hoverHandlers={hoverHandlers} handlers={properties} matrix={transformMatrix}>
      <primitive object={mesh} />
    </InteractionGroup>
  )
})

const propertyKeys = ['fit'] as const

function useTextureFit(
  collection: ManagerCollection,
  textureSignal: Signal<Texture | undefined>,
  borderInset: Signal<Inset>,
  size: Signal<Vector2Tuple>,
): void {
  const getPropertySignal = useGetBatchedProperties<ImageFitProperties>(collection, propertyKeys)
  useSignalEffect(() => {
    const texture = textureSignal.value
    if (texture == null) {
      return
    }
    const fitValue = getPropertySignal.value('fit') ?? FIT_DEFAULT
    texture.matrix.identity()

    if (fitValue === 'fill' || texture == null) {
      transformInsideBorder(borderInset, size, texture)
      return
    }

    const textureRatio = texture.image.width / texture.image.height

    const [width, height] = size.value
    const [top, right, bottom, left] = borderInset.value
    const boundsRatioValue = (width - left - right) / (height - top - bottom)

    if (fitValue === 'cover') {
      if (textureRatio > boundsRatioValue) {
        texture.matrix
          .translate(-(0.5 * (boundsRatioValue - textureRatio)) / boundsRatioValue, 0)
          .scale(boundsRatioValue / textureRatio, 1)
      } else {
        texture.matrix
          .translate(0, -(0.5 * (textureRatio - boundsRatioValue)) / textureRatio)
          .scale(1, textureRatio / boundsRatioValue)
      }
      transformInsideBorder(borderInset, size, texture)
      return
    }

    if (textureRatio > boundsRatioValue) {
      texture.matrix
        .translate(0, (-0.5 * (textureRatio - boundsRatioValue)) / textureRatio)
        .scale(1, boundsRatioValue / textureRatio)
    } else {
      texture.matrix
        .translate((0.5 * (boundsRatioValue - textureRatio)) / boundsRatioValue, 0)
        .scale(textureRatio / boundsRatioValue, 1)
    }
    transformInsideBorder(borderInset, size, texture)
  }, [textureSignal, borderInset, size])
}

function transformInsideBorder(borderInset: Signal<Inset>, size: Signal<Vector2Tuple>, texture: Texture): void {
  const [outerWidth, outerHeight] = size.value
  const [top, right, bottom, left] = borderInset.value

  const width = outerWidth - left - right
  const height = outerHeight - top - bottom

  texture.matrix
    .translate(-1 + (left + width) / outerWidth, -1 + (top + height) / outerHeight)
    .scale(outerWidth / width, outerHeight / height)
}

const textureLoader = new TextureLoader()

function loadTexture(src?: string | Texture) {
  if (src == null) {
    return Promise.resolve(undefined)
  }
  if (src instanceof Texture) {
    return Promise.resolve(src)
  }
  return textureLoader
    .loadAsync(src)
    .then((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.matrixAutoUpdate = false
      return texture
    })
    .catch((error) => {
      console.error(error)
      return undefined
    })
}
