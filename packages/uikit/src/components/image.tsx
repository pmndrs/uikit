import {
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Plane,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2Tuple,
} from 'three'
import { ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react'
import { useResourceWithParams, useRootGroupRef, useSignalEffect } from '../utils.js'
import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Inset, YogaProperties } from '../flex/node.js'
import { isPanelVisible, panelGeometry } from '../panel/utils.js'
import { InteractionGroup, MaterialClass, ShadowProperties } from '../panel/react.js'
import { useFlexNode } from '../flex/react.js'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { useApplyHoverProperties } from '../hover.js'
import {
  ComponentInternals,
  LayoutListeners,
  ChildrenProvider,
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
import { WithImmediateProperties, useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { ElementType, ZIndexOffset, setupRenderOrder, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'
import { useApplyActiveProperties } from '../active.js'
import { ScrollHandler, useScrollPosition, useScrollbars, ScrollbarProperties, ScrollListeners } from '../scroll.js'
import {
  createPanelMaterial,
  PanelDepthMaterial,
  PanelDistanceMaterial,
  panelMaterialDefaultData,
  panelMaterialSetters,
} from '../panel/panel-material.js'
import { WithBatchedProperties, useBatchedProperties } from '../properties/batched.js'

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
      > &
        ScrollbarProperties
    >
  >
>

export type ImageFitProperties = {
  fit?: ImageFit
}

export const Image = forwardRef<
  ComponentInternals,
  ImageProperties & {
    src?: string | Signal<string> | Texture | Signal<Texture | undefined>
    children?: ReactNode
    materialClass?: MaterialClass
    zIndexOffset?: ZIndexOffset
    keepAspectRatio?: boolean
  } & EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ShadowProperties &
    ScrollListeners
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
  const isHidden = useMemo(() => computed(() => isClipped.value || texture.value == null), [isClipped, texture])
  const materials = usePanelMaterials(
    collection,
    node.size,
    node.borderInset,
    isHidden,
    properties.materialClass,
    clippingPlanes,
    panelAliasPropertyTransformation,
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

  const scrollPosition = useScrollPosition()
  useScrollbars(
    collection,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    properties.scrollbarPanelMaterialClass,
    parentClippingRect,
    orderInfo,
  )

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  const activeHandlers = useApplyActiveProperties(collection, properties)
  if (properties.keepAspectRatio ?? true) {
    writeCollection(collection, 'aspectRatio', aspectRatio)
  }
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

  useSignalEffect(() => void (mesh.visible = !isHidden.value), [mesh, isHidden])

  useComponentInternals(ref, node, mesh, scrollPosition)

  return (
    <InteractionGroup
      groupRef={groupRef}
      hoverHandlers={hoverHandlers}
      handlers={properties}
      matrix={transformMatrix}
      activeHandlers={activeHandlers}
    >
      <ScrollHandler listeners={properties} node={node} scrollPosition={scrollPosition}>
        <primitive object={mesh} />
        <ChildrenProvider globalMatrix={globalMatrix} node={node} orderInfo={orderInfo} scrollPosition={scrollPosition}>
          {properties.children}
        </ChildrenProvider>
      </ScrollHandler>
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
    const get = getPropertySignal.value
    const texture = textureSignal.value
    if (texture == null || get == null) {
      return
    }
    const fit = get('fit') ?? FIT_DEFAULT
    texture.matrix.identity()

    if (fit === 'fill' || texture == null) {
      transformInsideBorder(borderInset, size, texture)
      return
    }

    const { width: textureWidth, height: textureHeight } = texture.source.data as { width: number; height: number }
    const textureRatio = textureWidth / textureHeight

    const [width, height] = size.value
    const [top, right, bottom, left] = borderInset.value
    const boundsRatioValue = (width - left - right) / (height - top - bottom)

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

async function loadTexture(src?: string | Texture) {
  if (src == null) {
    return Promise.resolve(undefined)
  }
  if (src instanceof Texture) {
    return Promise.resolve(src)
  }
  try {
    const texture = await textureLoader.loadAsync(src)
    texture.colorSpace = SRGBColorSpace
    texture.matrixAutoUpdate = false
    return texture
  } catch (error) {
    console.error(error)
    return undefined
  }
}

function usePanelMaterials(
  collection: ManagerCollection,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  materialClass: MaterialClass | undefined,
  clippingPlanes: Array<Plane>,
  propertyTransformation: PropertyTransformation,
): readonly [Material, Material, Material] {
  const { materials, setter } = useMemo(() => {
    const setter = new MaterialSetter(size, borderInset, isClipped)
    const info = { data: setter.data, type: 'normal' } as const
    const material = createPanelMaterial(materialClass ?? MeshBasicMaterial, info)
    const depthMaterial = new PanelDepthMaterial(info)
    const distanceMaterial = new PanelDistanceMaterial(info)
    material.clippingPlanes = clippingPlanes
    depthMaterial.clippingPlanes = clippingPlanes
    distanceMaterial.clippingPlanes = clippingPlanes
    return { materials: [material, depthMaterial, distanceMaterial], setter } as const
  }, [size, borderInset, isClipped, materialClass, clippingPlanes])
  useImmediateProperties(collection, setter, propertyTransformation)
  useBatchedProperties(collection, setter, propertyTransformation)
  useEffect(() => () => setter.destroy(), [setter])
  return materials
}

const batchedProperties = ['borderOpacity', 'opacity'] as const
type BatchedProperties = { borderOpacity?: number; opacity?: number }
type BatchedPropertiesKey = keyof BatchedProperties

const imageMaterialDefaultData = [...panelMaterialDefaultData]
imageMaterialDefaultData[4] = 1
imageMaterialDefaultData[5] = 1
imageMaterialDefaultData[6] = 1

class MaterialSetter implements WithBatchedProperties, WithImmediateProperties {
  //data layout: vec4 borderSize = data[0]; vec4 borderRadius = data[1]; vec3 borderColor = data[2].xyz; float borderBend = data[2].w; float borderOpacity = data[3].x; float width = data[3].y; float height = data[3].z; float backgroundOpacity = data[3].w;
  public readonly data = new Float32Array(16)

  private unsubscribeList: Array<() => void> = []
  private unsubscribe: () => void
  private visible = false
  private materials: Array<Material> = []

  active = signal(false)

  constructor(
    private size: Signal<Vector2Tuple>,
    borderInset: Signal<Inset>,
    isClipped: Signal<boolean>,
  ) {
    this.size = size
    this.unsubscribe = effect(() => {
      const get = this.getProperty.value
      const isVisible =
        get != null && isPanelVisible(borderInset, size, isClipped, get('borderOpacity'), get('opacity'), 0xffffff)
      this.active.value = isVisible
      if (!isVisible) {
        this.deactivate()
        return
      }
      this.activate(size, borderInset)
    })
  }
  addMaterial(material: Material) {
    material.visible = this.visible
    this.materials.push(material)
  }

  hasBatchedProperty(key: BatchedPropertiesKey): boolean {
    return batchedProperties.includes(key)
  }

  getProperty: Signal<undefined | (<K extends BatchedPropertiesKey>(key: K) => BatchedProperties[K]) | undefined> =
    signal(undefined)

  hasImmediateProperty(key: string): boolean {
    return key in panelMaterialSetters
  }

  setProperty(key: string, value: unknown): void {
    switch (key) {
      case 'backgroundOpacity':
      case 'backgroundColor':
        return
      case 'opacity':
        key = 'backgroundOpacity'
        break
    }
    const setter = panelMaterialSetters[key as keyof typeof panelMaterialSetters]
    setter(this.data, value as any, this.size)
  }

  private activate(size: Signal<Vector2Tuple>, borderInset: Signal<Inset>): void {
    if (this.visible) {
      return
    }

    this.visible = true
    this.syncVisible()

    this.data.set(imageMaterialDefaultData)
    this.unsubscribeList.push(
      effect(() => this.data.set(size.value, 13)),
      effect(() => this.data.set(borderInset.value, 0)),
    )
  }

  private deactivate(): void {
    if (!this.visible) {
      return
    }

    this.visible = false
    this.syncVisible()

    const unsubscribeListLength = this.unsubscribeList.length
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeList[i]()
    }
    this.unsubscribeList.length = 0
  }

  destroy(): void {
    this.deactivate()
    this.unsubscribe()
  }

  private syncVisible() {
    const materialsLength = this.materials.length
    for (let i = 0; i < materialsLength; i++) {
      this.materials[i].visible = this.visible
    }
  }
}
