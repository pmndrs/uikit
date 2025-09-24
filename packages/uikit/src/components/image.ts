import { Signal, computed, effect, signal } from '@preact/signals-core'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { Component } from './component.js'
import { SRGBColorSpace, Texture, TextureLoader, Vector2Tuple } from 'three'
import { abortableEffect, loadResourceWithParams, setupMatrixWorldUpdate } from '../utils.js'
import {
  createPanelMaterial,
  createPanelMaterialConfig,
  PanelDepthMaterial,
  PanelDistanceMaterial,
  PanelMaterialConfig,
} from '../panel/panel-material.js'
import { createGlobalClippingPlanes } from '../clipping.js'
import { Inset } from '../flex/index.js'
import { ElementType, setupOrderInfo, setupRenderOrder } from '../order.js'
import { componentDefaults } from '../properties/defaults.js'
import { RenderContext } from '../context.js'
import { resolvePanelMaterialClassProperty } from '../panel/instanced-panel-group.js'

export type ImageFit = 'cover' | 'fill'

export const imageDefaults = {
  ...componentDefaults,
  objectFit: 'fill' as ImageFit,
  keepAspectRatio: true,
}

export type ImageOutProperties<Src> = BaseOutProperties & {
  src?: Src
  aspectRatio?: number
} & typeof imageDefaults

export type ImageProperties = InProperties<ImageOutProperties<string | Texture>>

export class Image<
  OutProperties extends ImageOutProperties<unknown> = ImageOutProperties<string | Texture>,
> extends Component<OutProperties> {
  readonly texture = signal<Texture | undefined>(undefined)

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      loadTexture?: boolean
      defaults?: WithSignal<OutProperties>
    },
  ) {
    const aspectRatio = signal<number | undefined>(undefined)
    super(inputProperties, initialClasses, {
      defaults: imageDefaults as WithSignal<OutProperties>,
      hasNonUikitChildren: false,
      ...config,
      defaultOverrides: { aspectRatio, ...config?.defaultOverrides } as InProperties<OutProperties>,
    })

    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndex',
      ElementType.Image,
      undefined,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    this.frustumCulled = false
    setupRenderOrder(this, this.root, this.orderInfo)

    if (config?.loadTexture ?? true) {
      loadResourceWithParams(
        this.texture,
        loadTextureImpl,
        cleanupTexture,
        this.abortSignal,
        this.properties.signal.src as Signal<string | Texture | undefined>,
      )
    }

    const clippingPlanes = createGlobalClippingPlanes(this)
    const isMeshVisible = getImageMaterialConfig().computedIsVisibile(
      this.properties,
      this.borderInset,
      this.size,
      computed(() => this.isVisible && this.texture.value != null),
    )

    const data = new Float32Array(16)
    const info = { data: data, type: 'normal' } as const
    this.customDepthMaterial = new PanelDepthMaterial(info)
    this.customDistanceMaterial = new PanelDistanceMaterial(info)
    this.customDepthMaterial.clippingPlanes = clippingPlanes
    this.customDistanceMaterial.clippingPlanes = clippingPlanes

    abortableEffect(() => {
      this.material.depthTest = this.properties.value.depthTest
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.material.depthWrite = this.properties.value.depthWrite ?? false
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      ;(this.material as any).map = this.texture.value ?? null
      this.material.needsUpdate = true
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      const material = createPanelMaterial(
        resolvePanelMaterialClassProperty(this.properties.value.panelMaterialClass),
        info,
      )
      material.clippingPlanes = clippingPlanes
      ;(material as any).map = (this.material as any).map
      material.depthWrite = this.material.depthWrite
      material.depthTest = this.material.depthTest
      this.material = material
      return () => material.dispose()
    }, this.abortSignal)
    abortableEffect(() => {
      this.renderOrder = this.properties.value.renderOrder
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.castShadow = this.properties.value.castShadow
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.receiveShadow = this.properties.value.receiveShadow
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    setupMatrixWorldUpdate(this, this.root, this.globalPanelMatrix, this.abortSignal)

    const imageMaterialConfig = getImageMaterialConfig()
    abortableEffect(() => {
      if (!this.isVisible.value) {
        return
      }

      data.set(imageMaterialConfig.defaultData)

      const cleanupSizeEffect = effect(() => void (this.size.value != null && data.set(this.size.value, 14)))
      const cleanupBorderEffect = effect(
        () => void (this.borderInset.value != null && data.set(this.borderInset.value, 0)),
      )
      this.root.peek().requestRender?.()
      return () => {
        cleanupSizeEffect()
        cleanupBorderEffect()
      }
    }, this.abortSignal)
    const setters = imageMaterialConfig.setters
    abortableEffect(() => {
      if (!this.isVisible.value) {
        return
      }
      return this.properties.subscribePropertyKeys((key) => {
        if (!imageMaterialConfig.hasProperty(key as string)) {
          return
        }
        abortableEffect(() => {
          setters[key as any]!(
            data,
            0,
            this.properties.value[key as keyof OutProperties],
            this.size,
            this.properties.signal.opacity,
            undefined,
          )
          this.root.peek().requestRender?.()
        }, this.abortSignal)
      })
    }, this.abortSignal)

    abortableEffect(() => {
      const texture = this.texture.value
      if (texture == null || this.size.value == null || this.borderInset.value == null) {
        return
      }
      texture.matrix.identity()
      this.root.peek().requestRender?.()

      if (this.properties.value.objectFit === 'fill' || texture == null) {
        transformInsideBorder(this.borderInset, this.size, texture)
        return
      }

      const { width: textureWidth, height: textureHeight } = texture.source.data as { width: number; height: number }
      const textureRatio = textureWidth / textureHeight

      const [width, height] = this.size.value
      const [top, right, bottom, left] = this.borderInset.value
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
      transformInsideBorder(this.borderInset, this.size, texture)
    }, this.abortSignal)
    abortableEffect(() => {
      this.visible = isMeshVisible.value
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    abortableEffect(() => {
      if (!this.properties.value.keepAspectRatio) {
        aspectRatio.value = undefined
        return
      }
      const tex = this.texture.value
      if (tex == null) {
        aspectRatio.value = undefined
        return
      }
      const image = tex.source.data
      const width = image.videoWidth ?? image.naturalWidth ?? image.width
      const height = image.videoHeight ?? image.naturalHeight ?? image.height
      aspectRatio.value = width / height
    }, this.abortSignal)
  }

  add(): this {
    throw new Error(`the image component can not have any children`)
  }
}

function transformInsideBorder(
  borderInset: Signal<Inset | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  texture: Texture,
): void {
  if (size.value == null || borderInset.value == null) {
    return
  }

  const [outerWidth, outerHeight] = size.value
  const [top, right, bottom, left] = borderInset.value

  const width = outerWidth - left - right
  const height = outerHeight - top - bottom

  texture.matrix
    .translate(-1 + (left + width) / outerWidth, -1 + (top + height) / outerHeight)
    .scale(outerWidth / width, outerHeight / height)
}

const textureLoader = new TextureLoader()

function cleanupTexture(texture: (Texture & { disposable?: boolean }) | undefined): void {
  if (texture?.disposable === true) {
    texture.dispose()
  }
}

async function loadTextureImpl(src?: string | Texture): Promise<(Texture & { disposable?: boolean }) | undefined> {
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
    return Object.assign(texture, { disposable: true })
  } catch (error) {
    console.error(error)
    return undefined
  }
}

let imageMaterialConfig: PanelMaterialConfig | undefined
function getImageMaterialConfig() {
  imageMaterialConfig ??= createPanelMaterialConfig(
    {
      borderBend: 'borderBend',
      borderBottomLeftRadius: 'borderBottomLeftRadius',
      borderBottomRightRadius: 'borderBottomRightRadius',
      borderColor: 'borderColor',
      borderTopLeftRadius: 'borderTopLeftRadius',
      borderTopRightRadius: 'borderTopRightRadius',
    },
    {
      backgroundColor: 0xffffff,
    },
  )
  return imageMaterialConfig
}
