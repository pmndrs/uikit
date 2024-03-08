import {
  Color,
  ColorRepresentation,
  FrontSide,
  Material,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  Plane,
  RGBADepthPacking,
  Vector2Tuple,
  WebGLProgramParametersWithUniforms,
  WebGLRenderer,
} from 'three'
import { Constructor, isPanelVisible, setBorderRadius } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { Inset } from '../flex/node.js'
import { PanelProperties } from './instanced-panel.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { createGetBatchedProperties } from '../properties/batched.js'
import { MergedProperties } from '../properties/merged.js'
import { Subscriptions } from '../utils.js'

export type MaterialClass = { new (...args: Array<any>): Material }

export function createPanelMaterials(
  propertiesSignal: Signal<MergedProperties>,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  materialClass: MaterialClass | undefined,
  clippingPlanes: Array<Plane>,
  subscriptions: Subscriptions,
  renameOutput?: Record<string, string>,
): readonly [Material, Material, Material] {
  const data = new Float32Array(16)
  const info = { data: data, type: 'normal' } as const
  const material = createPanelMaterial(materialClass ?? MeshBasicMaterial, info)
  const depthMaterial = new PanelDepthMaterial(info)
  const distanceMaterial = new PanelDistanceMaterial(info)
  material.clippingPlanes = clippingPlanes
  depthMaterial.clippingPlanes = clippingPlanes
  distanceMaterial.clippingPlanes = clippingPlanes
  const materials = [material, depthMaterial, distanceMaterial] as const
  applyPropsToMaterialData(propertiesSignal, data, size, borderInset, isClipped, materials, subscriptions, renameOutput)
  return materials
}

type InstanceOf<T> = T extends { new (): infer K } ? K : never

const colorHelper = new Color()

export const panelDefaultColor = new Color(-1, -1, -1)

const panelMaterialSetters: {
  [Key in keyof PanelProperties]-?: (
    data: Float32Array,
    value: PanelProperties[Key],
    size: Signal<Vector2Tuple>,
  ) => void
} = {
  //0-3 = borderSizes

  //4-6 = background color
  backgroundColor: (d, p) =>
    (Array.isArray(p) ? colorHelper.setRGB(...p) : colorHelper.set(p ?? panelDefaultColor)).toArray(d, 4),

  //7 = border radiuses
  borderBottomLeftRadius: (d, p, size) => setBorderRadius(d, 7, 0, p, size.value[1]),
  borderBottomRightRadius: (d, p, size) => setBorderRadius(d, 7, 1, p, size.value[1]),
  borderTopRightRadius: (d, p, size) => setBorderRadius(d, 7, 2, p, size.value[1]),
  borderTopLeftRadius: (d, p, size) => setBorderRadius(d, 7, 3, p, size.value[1]),

  //8 - 10 = border color
  borderColor: (d, p) => (Array.isArray(p) ? colorHelper.setRGB(...p) : colorHelper.set(p ?? 0xffffff)).toArray(d, 8),
  //11
  borderBend: (d, p) => (d[11] = p ?? 0),
  //12
  borderOpacity: (d, p) => (d[12] = p ?? 1),

  //13 = width
  //14 = height

  //15
  backgroundOpacity: (d, p) => (d[15] = p ?? -1),
}

export type PanelSetter = (typeof panelMaterialSetters)[keyof typeof panelMaterialSetters]

export type PanelMaterial = InstanceOf<ReturnType<typeof createPanelMaterial>>

export const panelMaterialDefaultData = [
  0,
  0,
  0,
  0, //border sizes
  -1,
  -1,
  -1, //background color
  0, //border radiuses
  1,
  1,
  1, //border color
  0, //border bend
  1, //border opacity
  1, //width
  1, //height
  -1, //background opacity
]

const batchedProperties = ['borderOpacity', 'backgroundColor', 'backgroundOpacity']

function hasBatchedProperty(key: string): boolean {
  return batchedProperties.includes(key)
}

function hasImmediateProperty(key: string): boolean {
  return key in panelMaterialSetters
}

export function applyPropsToMaterialData(
  propertiesSignal: Signal<MergedProperties>,
  data: Float32Array,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  materials: ReadonlyArray<Material>,
  subscriptions: Subscriptions,
  renameOutput?: Record<string, string>,
) {
  const unsubscribeList: Array<() => void> = []
  const active = signal(false)
  let visible = false
  setupImmediateProperties(
    propertiesSignal,
    active,
    hasImmediateProperty,
    (key, value) => {
      const setter = panelMaterialSetters[key as keyof typeof panelMaterialSetters]
      setter(data, value as any, size)
    },
    subscriptions,
    renameOutput,
  )
  const materialsLength = materials.length
  const syncVisible = () => {
    for (let i = 0; i < materialsLength; i++) {
      materials[i].visible = visible
    }
  }
  const deactivate = () => {
    if (!visible) {
      return
    }

    visible = false
    syncVisible()

    const unsubscribeListLength = unsubscribeList.length
    for (let i = 0; i < unsubscribeListLength; i++) {
      unsubscribeList[i]()
    }
    unsubscribeList.length = 0
  }
  const get = createGetBatchedProperties(propertiesSignal, hasBatchedProperty, renameOutput)
  subscriptions.push(
    effect(() => {
      const isVisible = isPanelVisible(
        borderInset,
        size,
        isClipped,
        get('borderOpacity') as number,
        get('backgroundOpacity') as number,
        get('backgroundColor') as ColorRepresentation,
      )
      active.value = isVisible
      if (!isVisible) {
        deactivate()
        return
      }
      if (visible) {
        return
      }

      visible = true
      syncVisible()

      data.set(panelMaterialDefaultData)
      unsubscribeList.push(
        effect(() => data.set(size.value, 13)),
        effect(() => data.set(borderInset.value, 0)),
      )
    }),
  )
  subscriptions.push(deactivate)
}

export type PanelMaterialInfo = { type: 'instanced' } | { type: 'normal'; data: Float32Array }

export function createPanelMaterial<T extends Constructor<Material>>(MaterialClass: T, info: PanelMaterialInfo) {
  const material = new MaterialClass()
  if (material.defines == null) {
    material.defines = {}
  }
  material.side = FrontSide
  material.clipShadows = true
  material.transparent = true
  material.toneMapped = false
  material.depthWrite = false
  material.shadowSide = FrontSide
  material.defines.USE_UV = ''
  material.defines.USE_TANGENT = ''

  const superOnBeforeCompile = material.onBeforeCompile
  material.onBeforeCompile = (parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {
    superOnBeforeCompile.call(material, parameters, renderer)
    if (info.type === 'normal') {
      parameters.uniforms.data = { value: info.data }
    }
    compilePanelMaterial(parameters, info.type === 'instanced')
  }
  return material
}

export class PanelDistanceMaterial extends MeshDistanceMaterial {
  constructor(private info: PanelMaterialInfo) {
    super()
    if (this.defines == null) {
      this.defines = {}
    }
    this.defines.USE_UV = ''
    this.clipShadows = true
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    super.onBeforeCompile(parameters, renderer)
    if (this.info.type === 'normal') {
      parameters.uniforms.data = { value: this.info.data }
    }
    compilePanelDepthMaterial(parameters, this.info.type === 'instanced')
  }
}

export class PanelDepthMaterial extends MeshDepthMaterial {
  constructor(private info: PanelMaterialInfo) {
    super({ depthPacking: RGBADepthPacking })
    if (this.defines == null) {
      this.defines = {}
    }
    this.defines.USE_UV = ''
    this.clipShadows = true
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    super.onBeforeCompile(parameters, renderer)
    if (this.info.type === 'normal') {
      parameters.uniforms.data = { value: this.info.data }
    }
    compilePanelDepthMaterial(parameters, this.info.type === 'instanced')
  }
}

export const instancedPanelDepthMaterial = new PanelDepthMaterial({ type: 'instanced' })
export const instancedPanelDistanceMaterial = new PanelDistanceMaterial({ type: 'instanced' })

function compilePanelDepthMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  compilePanelClippingMaterial(parameters, instanced)
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    `#include <clipping_planes_fragment>
    ${getFargmentOpacityCode(instanced, undefined)}
    `,
  )
}

function compilePanelClippingMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  parameters.vertexShader = parameters.vertexShader.replace(
    '#include <common>',
    ` #include <common>
      out vec4 borderRadius;
      ${instanced ? '' : 'uniform highp mat4 data;'}`,
  )

  parameters.vertexShader = parameters.vertexShader.replace(
    '#include <uv_vertex>',
    ` #include <uv_vertex>
      highp int packedBorderRadius = int(data[1].w);
      borderRadius = vec4(
        packedBorderRadius / 125000 % 50,
        packedBorderRadius / 2500 % 50,
        packedBorderRadius / 50 % 50,
        packedBorderRadius % 50
      ) * vec4(0.5 / 50.0);`,
  )

  if (instanced) {
    parameters.vertexShader = parameters.vertexShader.replace(
      '#include <common>',
      ` #include <common>
        attribute highp mat4 aData;
        attribute mat4 aClipping;
        out mat4 data;
        out mat4 clipping;
        out vec3 localPosition;`,
    )

    parameters.vertexShader = parameters.vertexShader.replace(
      '#include <uv_vertex>',
      ` #include <uv_vertex>
        data = aData;
        clipping = aClipping;
        localPosition = (instanceMatrix * vec4(position, 1.0)).xyz;`,
    )
  }

  parameters.fragmentShader =
    `${instanced ? 'in' : 'uniform'} highp mat4 data;
    in vec4 borderRadius;
    ${
      instanced
        ? `
    in vec3 localPosition;
    in mat4 clipping;
    `
        : ''
    }

    float min4 (vec4 v) {
        return min(min(min(v.x,v.y),v.z),v.w);
    }
    float max4 (vec4 v) {
        return max(max(max(v.x,v.y),v.z),v.w);
    }
    vec2 radiusDistance(float radius, vec2 outside, vec2 border, vec2 borderSize) {
        vec2 outerRadiusXX = vec2(radius, radius);
        vec2 innerRadiusXX = outerRadiusXX - borderSize;
        vec2 radiusWeightUnnormalized = abs(innerRadiusXX - border);
        vec2 radiusWeight = radiusWeightUnnormalized / vec2(radiusWeightUnnormalized.x + radiusWeightUnnormalized.y);
        return vec2(
            radius - distance(outside, outerRadiusXX),
            dot(radiusWeight, innerRadiusXX) - distance(border, innerRadiusXX)
        );
    }
    ` + parameters.fragmentShader
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    ` ${
      instanced
        ? `
        vec4 plane;
        float distanceToPlane, distanceGradient;
        float clipOpacity = 1.0;

        for(int i = 0; i < 4; i++) {
          plane = clipping[ i ];
          distanceToPlane = - dot( -localPosition, plane.xyz ) + plane.w;
          distanceGradient = fwidth( distanceToPlane ) / 2.0;
          clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
    
          if ( clipOpacity < 0.01 ) discard;
        }
        `
        : ''
    }
        vec4 absoluteBorderSize = data[0];
        vec3 backgroundColor = data[1].xyz;
        vec3 borderColor = data[2].xyz;
        float borderBend = data[2].w;
        float borderOpacity = data[3].x;
        float width = data[3].y;
        float height = data[3].z;
        float backgroundOpacity = data[3].w;
        float ratio = width / height;
        vec4 relative = vec4(height, height, height, height);
        vec4 borderSize = absoluteBorderSize / relative;
        vec4 v_outsideDistance = vec4(1.0 - vUv.y, (1.0 - vUv.x) * ratio, vUv.y, vUv.x * ratio);
        vec4 v_borderDistance = v_outsideDistance - borderSize;
  
        vec2 distance = vec2(min4(v_outsideDistance), min4(v_borderDistance));
        vec4 negateBorderDistance = vec4(1.0) - v_borderDistance;
        float maxWeight = max4(negateBorderDistance);
        vec4 borderWeight = step(maxWeight, negateBorderDistance);
  
        vec4 insideBorder;
  
        if(all(lessThan(v_outsideDistance.xw, borderRadius.xx))) {
            distance = radiusDistance(borderRadius.x, v_outsideDistance.xw, v_borderDistance.xw, borderSize.xw);
            
            float tmp = borderRadius.x - borderSize.w;
            vec2 xIntersection = vec2(tmp, tmp / ratio);
            tmp = borderRadius.x - borderSize.x;
            vec2 yIntersection = vec2(tmp * ratio, tmp);
            vec2 lineIntersection = min(xIntersection, yIntersection);
  
            insideBorder.yz = vec2(0.0);
            insideBorder.xw = max(vec2(0.0), lineIntersection - v_borderDistance.xw);
  
        } else if(all(lessThan(v_outsideDistance.xy, borderRadius.yy))) {
            distance = radiusDistance(borderRadius.y, v_outsideDistance.xy, v_borderDistance.xy, borderSize.xy);
  
            float tmp = borderRadius.y - borderSize.y;
            vec2 xIntersection = vec2(tmp, tmp / ratio);
            tmp = borderRadius.y - borderSize.x;
            vec2 yIntersection = vec2(tmp * ratio, tmp);
            vec2 lineIntersection = min(xIntersection, yIntersection);
  
            insideBorder.zw = vec2(0.0);
            insideBorder.xy = max(vec2(0.0), lineIntersection - v_borderDistance.xy);
  
        } else if(all(lessThan(v_outsideDistance.zy, borderRadius.zz))) {
            distance = radiusDistance(borderRadius.z, v_outsideDistance.zy, v_borderDistance.zy, borderSize.zy);
  
            float tmp = borderRadius.z - borderSize.y;
            vec2 xIntersection = vec2(tmp, tmp / ratio);
            tmp = borderRadius.z - borderSize.z;
            vec2 yIntersection = vec2(tmp * ratio, tmp);
            vec2 lineIntersection = min(xIntersection, yIntersection);
  
            insideBorder.xw = vec2(0.0);
            insideBorder.zy =max(vec2(0.0), lineIntersection - v_borderDistance.zy);
  
        } else if(all(lessThan(v_outsideDistance.zw, borderRadius.ww))) {
            distance = radiusDistance(borderRadius.w, v_outsideDistance.zw, v_borderDistance.zw, borderSize.zw);
  
            float tmp = borderRadius.w - borderSize.w;
            vec2 xIntersection = vec2(tmp, tmp / ratio);
            tmp = borderRadius.w - borderSize.z;
            vec2 yIntersection = vec2(tmp * ratio, tmp);
            vec2 lineIntersection = min(xIntersection, yIntersection);
  
            insideBorder.xy = vec2(0.0);
            insideBorder.zw = max(vec2(0.0), lineIntersection - v_borderDistance.zw);
  
        }
  
        if(insideBorder.x + insideBorder.y + insideBorder.z + insideBorder.w > 0.0) {
          borderWeight = normalize(insideBorder);
        }
  
        #include <clipping_planes_fragment>`,
  )
}

function getFargmentOpacityCode(instanced: boolean, existingOpacity: string | undefined) {
  return `float ddx = fwidth(distance.x);
  float outer = smoothstep(-ddx, ddx, distance.x);

  float ddy = fwidth(distance.y);
  float inner = smoothstep(-ddy, ddy, distance.y);

  float transition = 1.0 - step(0.1, outer - inner) * (1.0 - inner);

  if(backgroundColor.r < 0.0 && backgroundOpacity >= 0.0) {
    backgroundColor = vec3(1.0);
  }
  if(backgroundOpacity < 0.0) {
    backgroundOpacity = backgroundColor.r >= 0.0 ? 1.0 : 0.0;
  }

  if(backgroundOpacity < 0.0) {
    backgroundOpacity = 0.0;
  }

  float outOpacity = ${
    instanced ? 'clipOpacity * ' : ''
  } outer * mix(borderOpacity, ${existingOpacity == null ? '' : `${existingOpacity} *`} backgroundOpacity, transition);

  if(outOpacity < 0.01) {
    discard;
  }`
}

export function compilePanelMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  compilePanelClippingMaterial(parameters, instanced)

  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <color_fragment>',
    ` #include <color_fragment>
      ${getFargmentOpacityCode(instanced, 'diffuseColor.a')}
      diffuseColor.rgb = mix(borderColor, diffuseColor.rgb * backgroundColor, transition);
      diffuseColor.a = outOpacity;
      `,
  )
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    ` #include <normal_fragment_maps>
      vec3 b = normalize(vBitangent);
      vec3 t = normalize(vTangent);
      mat4 directions = mat4(vec4(b, 1.0), vec4(t, 1.0), vec4(-b, 1.0), vec4(-t, 1.0));
      float currentBorderSize = distance.x - distance.y;
      float outsideNormalWeight = currentBorderSize < 0.00001 ? 0.0 : max(0.0, -distance.y / currentBorderSize) * borderBend;
      vec3 outsideNormal = (borderWeight * transpose(directions)).xyz;
      normal = normalize(outsideNormalWeight * outsideNormal + (1.0 - outsideNormalWeight) * normal);
    `,
  )
}
