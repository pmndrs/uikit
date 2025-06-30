import {
  Color,
  FrontSide,
  Material,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
  TypedArray,
  Vector2Tuple,
  WebGLProgramParametersWithUniforms,
  WebGLRenderer,
} from 'three'
import { Constructor, setBorderRadius } from './utils.js'
import { Signal, computed, signal } from '@preact/signals-core'
import { ColorRepresentation } from '../utils.js'
import { Properties } from '../properties/index.js'
import { Inset } from '../flex/index.js'
import { toAbsoluteNumber } from '../text/utils.js'

export type MaterialClass = { new (...args: Array<any>): Material }

type InstanceOf<T> = T extends { new (): infer K } ? K : never

const defaultDefaults = {
  backgroundColor: 'transparent' as ColorRepresentation,
  borderColor: 'transparent' as ColorRepresentation,
  borderBottomLeftRadius: 0,
  borderTopLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderTopRightRadius: 0,
  borderBend: 0,
} satisfies { [Key in keyof typeof materialSetters]: unknown }

const defaultOpacity = 1

export type PanelMaterialConfig = ReturnType<typeof createPanelMaterialConfig>

let defaultPanelMaterialConfig: PanelMaterialConfig | undefined
export function getDefaultPanelMaterialConfig() {
  if (defaultPanelMaterialConfig == null) {
    const defaultPanelMaterialKeys = {} as { [Key in keyof typeof defaultDefaults]: string }
    for (const key in defaultDefaults) {
      defaultPanelMaterialKeys[key as keyof typeof defaultDefaults] = key
    }
    defaultPanelMaterialConfig = createPanelMaterialConfig(defaultPanelMaterialKeys)
  }
  return defaultPanelMaterialConfig
}

const colorArrayHelper = [0, 0, 0, 0]

export function createPanelMaterialConfig(
  keys: { [Key in keyof typeof materialSetters]?: string },
  overrideDefaults?: {
    [Key in Exclude<
      keyof typeof defaultDefaults,
      'borderBottomLeftRadius' | 'borderTopLeftRadius' | 'borderBottomRightRadius' | 'borderTopRightRadius'
    >]?: (typeof defaultDefaults)[Key]
  },
) {
  const defaults = { ...defaultDefaults, ...overrideDefaults }

  const setters: {
    [Key in string]: (
      data: TypedArray,
      offset: number,
      value: unknown,
      size: Signal<Vector2Tuple | undefined>,
      opacity: Signal<number | `${number}%`>,
      onUpdate: ((start: number, count: number) => void) | undefined,
    ) => void
  } = {}
  for (const key in keys) {
    const fn = materialSetters[key as keyof typeof materialSetters]
    const defaultValue = defaults[key as keyof typeof materialSetters]
    setters[keys[key as keyof typeof materialSetters]!] = (data, offset, value, size, opacity, onUpdate) =>
      fn(data, offset, (value ?? defaultValue) as any, size, opacity, onUpdate)
  }

  const defaultData = new Float32Array(16) //filled with 0s by default
  writeColor(defaultData, 4, defaults.backgroundColor, defaultOpacity, undefined)
  writeColor(defaultData, 9, defaults.borderColor, defaultOpacity, undefined)
  defaultData[13] = defaults.borderBend
  return {
    hasProperty: (key: string) => key in setters,
    defaultData,
    setters,
    computedIsVisibile: (
      properties: Properties,
      borderInset: Signal<Inset | undefined>,
      size: Signal<Vector2Tuple | undefined>,
      isVisible: Signal<boolean>,
    ) => {
      return computed(() => {
        if (borderInset.value == null || size.value == null) {
          return false
        }
        const backgroundColor =
          keys.backgroundColor == null
            ? defaults.backgroundColor
            : (properties.value[keys.backgroundColor as 'backgroundColor'] ?? defaults.backgroundColor)
        const borderColor =
          keys.borderColor == null
            ? defaults.borderColor
            : (properties.value[keys.borderColor as 'borderColor'] ?? defaults.borderColor)

        const opacity = toAbsoluteNumber(properties.value.opacity ?? defaultOpacity, () => 1)

        writeColor(colorArrayHelper, 0, backgroundColor ?? defaults.backgroundColor, opacity)
        const [width, height] = size.value
        const backgroundVisible = width > 0 && height > 0 && colorArrayHelper[3]! > 0

        writeColor(colorArrayHelper, 0, borderColor ?? defaults.borderColor, opacity)
        const borderVisible = borderInset.value.some((s) => s > 0) && colorArrayHelper[3]! > 0

        if (!backgroundVisible && !borderVisible) {
          return false
        }

        return isVisible.value
      })
    },
  }
}

const materialSetters = {
  //0-3 = borderSizes

  //4-7 = background color
  backgroundColor: (d, o, p: ColorRepresentation, _, op, u) =>
    writeColor(
      d,
      o + 4,
      p,
      toAbsoluteNumber(op.value, () => 1),
      u,
    ),

  //8 = border radiuses
  borderBottomLeftRadius: (d, o, p: number, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 0, p, s[1], u),
  borderBottomRightRadius: (d, o, p: number, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 1, p, s[1], u),
  borderTopRightRadius: (d, o, p: number, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 2, p, s[1], u),
  borderTopLeftRadius: (d, o, p: number, { value: s }, _, u) => s != null && writeBorderRadius(d, o + 8, 3, p, s[1], u),

  //9 - 12 = border color
  borderColor: (d, o, p: ColorRepresentation, _, op, u) =>
    writeColor(
      d,
      o + 9,
      p,
      toAbsoluteNumber(op.value, () => 1),
      u,
    ),
  //13
  borderBend: (d, o, p: number | `${number}%`, _, op, u) =>
    writeComponent(
      d,
      o + 13,
      toAbsoluteNumber(p, () => 1),
      u,
    ),

  //14 = width
  //15 = height
} as const satisfies {
  [Key in string]: (
    data: TypedArray,
    offset: number,
    value: any,
    size: Signal<Vector2Tuple | undefined>,
    opacity: Signal<number | `${number}%`>,
    onUpdate: ((start: number, count: number) => void) | undefined,
  ) => void
}

function writeBorderRadius(
  data: TypedArray,
  offset: number,
  indexInFloat: number,
  value: any,
  height: number,
  onUpdate: ((start: number, count: number) => void) | undefined,
): void {
  setBorderRadius(data, offset, indexInFloat, value, height)
  onUpdate?.(offset, 1)
}

function writeComponent(
  data: TypedArray,
  offset: number,
  value: any,
  onUpdate: ((start: number, count: number) => void) | undefined,
): void {
  data[offset] = value
  onUpdate?.(offset, 1)
}

const colorHelper = new Color()

const rgbaRegex = /rgba\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\)/

export function writeColor(
  target: Array<number> | TypedArray,
  offset: number,
  color: ColorRepresentation,
  opacity: number,
  onUpdate?: ((start: number, count: number) => void) | undefined,
) {
  let match: RegExpMatchArray | null
  if (Array.isArray(color)) {
    for (let i = 0; i < color.length; i++) {
      target[i + offset] = color[i]!
    }
    target[offset + 3] = (color.length === 3 ? 1 : target[offset + 3]!) * opacity
  } else if (color === 'transparent') {
    target.fill(0, offset, offset + 4)
  } else if (typeof color === 'string' && (match = color.match(rgbaRegex)) != null) {
    for (let i = 0; i < 3; i++) {
      target[i + offset] = parseFloat(match[i]!) / 255
    }
    target[3 + offset] = parseFloat(match[3]!) * opacity
  } else {
    colorHelper.set(color).toArray(target, offset)
    target[offset + 3] = opacity
  }
  onUpdate?.(offset, 4)
}

export type PanelMaterial = InstanceOf<ReturnType<typeof createPanelMaterial>>

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
      highp int packedBorderRadius = int(data[2].x);
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
        float backgroundOpacity = data[1].w;
        vec3 borderColor = data[2].yzw;
        float borderOpacity = data[3].x;
        float borderBend = data[3].y;
        float width = data[3].z;
        float height = data[3].w;
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
