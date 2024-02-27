import { Color, Material, TypedArray, Vector2Tuple, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three'
import { Constructor, isPanelVisible, setBorderRadius, setComponentInFloat } from './utils.js'
import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Inset } from '../flex/node.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { PanelProperties } from './instanced-panel.js'
import { Properties, readReactiveProperty } from '../properties/utils.js'
import { WithImmediateProperties } from '../properties/immediate.js'
import { WithBatchedProperties } from '../properties/batched.js'

type InstanceOf<T> = T extends { new (): infer K } ? K : never

const colorHelper = new Color()

export const panelDefaultColor = new Color(-1, -1, -1)

const panelMaterialSetters: {
  [Key in keyof PanelProperties]-?: (
    material: InstanceOf<ReturnType<typeof createPanelMaterial>>,
    value: PanelProperties[Key],
    size: Signal<Vector2Tuple>,
  ) => void
} = {
  //0-3 = borderSizes

  //4-6 = background color
  backgroundColor: (m, p) =>
    (Array.isArray(p) ? colorHelper.setRGB(...p) : colorHelper.set(p ?? panelDefaultColor)).toArray(m.data, 4),

  //7 = border radiuses
  borderBottomLeftRadius: (m, p, size) => setBorderRadius(m.data, 7, 0, p, size.value[1]),
  borderBottomRightRadius: (m, p, size) => setBorderRadius(m.data, 7, 1, p, size.value[1]),
  borderTopRightRadius: (m, p, size) => setBorderRadius(m.data, 7, 2, p, size.value[1]),
  borderTopLeftRadius: (m, p, size) => setBorderRadius(m.data, 7, 3, p, size.value[1]),

  //8 - 10 = border color
  borderColor: (m, p) =>
    (Array.isArray(p) ? colorHelper.setRGB(...p) : colorHelper.set(p ?? 0xffffff)).toArray(m.data, 8),
  //11
  borderBend: (m, p) => (m.data[11] = p ?? 0),
  //12
  borderOpacity: (m, p) => (m.data[12] = p ?? 1),

  //13 = width
  //14 = height

  //15
  backgroundOpacity: (m, p) => (m.data[15] = p ?? -1),
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

const batchedProperties = ['borderOpacity', 'backgroundColor', 'backgroundOpacity'] as const
type BatchedProperties = Pick<PanelProperties, (typeof batchedProperties)[number]>
type BatchedPropertiesKey = keyof BatchedProperties

export function createPanelMaterial<T extends Constructor<Material>>(MaterialClass: T) {
  return class extends MaterialClass implements WithImmediateProperties, WithBatchedProperties<BatchedProperties> {
    //data layout: vec4 borderSize = data[0]; vec4 borderRadius = data[1]; vec3 borderColor = data[2].xyz; float borderBend = data[2].w; float borderOpacity = data[3].x; float width = data[3].y; float height = data[3].z; float backgroundOpacity = data[3].w;
    readonly data = new Float32Array(16)

    unsubscribeList: Array<() => void> = []
    unsubscribe!: () => void
    active = signal(false)

    size!: Signal<Vector2Tuple>

    constructor(...args: Array<any>) {
      super({ transparent: true, toneMapped: false, depthWrite: false }, ...args.slice(1))
      if (this.defines == null) {
        this.defines = {}
      }
      this.defines.USE_UV = ''
      this.defines.USE_TANGENT = ''
      this.visible = false
    }

    hasBatchedProperty(key: BatchedPropertiesKey): boolean {
      return batchedProperties.includes(key)
    }

    getProperty: Signal<<K extends BatchedPropertiesKey>(key: K) => BatchedProperties[K]> = signal(() => undefined)

    setup(size: Signal<Vector2Tuple>, borderInset: Signal<Inset>, isClipped: Signal<boolean>) {
      this.size = size
      this.unsubscribe = effect(() => {
        const get = this.getProperty.value
        const isVisible = isPanelVisible(
          borderInset,
          size,
          isClipped,
          get('borderOpacity'),
          get('backgroundOpacity'),
          get('backgroundColor'),
        )
        this.active.value = isVisible
        if (!isVisible) {
          this.deactivate()
          return
        }
        this.activate(size, borderInset)
      })
    }

    hasImmediateProperty(key: string): boolean {
      return key in panelMaterialSetters
    }

    setProperty(key: string, value: unknown): void {
      panelMaterialSetters[key as keyof typeof panelMaterialSetters](this, value as any, this.size)
    }

    activate(size: Signal<Vector2Tuple>, borderInset: Signal<Inset>): void {
      if (this.visible) {
        return
      }
      this.visible = true
      this.data.set(panelMaterialDefaultData)
      this.unsubscribeList.push(
        effect(() => this.data.set(size.value, 13)),
        effect(() => this.data.set(borderInset.value, 0)),
      )
    }

    deactivate(): void {
      if (!this.visible) {
        return
      }

      this.visible = false
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

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
      super.onBeforeCompile(parameters, renderer)
      parameters.uniforms.data = { value: this.data }
      compilePanelMaterial(parameters, false)
    }
  }
}

export function createInstancedPanelMaterial<T extends Constructor<Material>>(MaterialClass: T) {
  return class extends MaterialClass {
    constructor(...args: Array<any>) {
      super({ transparent: true, depthWrite: false, toneMapped: false, ...args[0] }, ...args.slice(1))
      if (this.defines == null) {
        this.defines = {}
      }
      this.defines.USE_UV = ''
      this.defines.USE_TANGENT = ''
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
      super.onBeforeCompile(parameters, renderer)
      compilePanelMaterial(parameters, true)
    }
  }
}

export function compilePanelMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  if (instanced) {
    parameters.vertexShader = parameters.vertexShader.replace(
      '#include <common>',
      ` #include <common>
        attribute mat4 aData;
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
    `${instanced ? 'in' : 'uniform'} mat4 data;
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
  
        if ( clipOpacity == 0.0 ) discard;
      }
      `
        : ''
    }
      vec4 absoluteBorderSize = data[0];
      vec3 backgroundColor = data[1].xyz;
      int packedBorderRadius = int(data[1].w);
      vec4 borderRadius = vec4(packedBorderRadius / 50 / 50 / 50 % 50, packedBorderRadius / 50 / 50 % 50, packedBorderRadius / 50 % 50, packedBorderRadius % 50) * vec4(0.5 / 50.0);
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

      vec2 dist = vec2(min4(v_outsideDistance), min4(v_borderDistance));
      vec4 negateBorderDistance = vec4(1.0) - v_borderDistance;
      float maxWeight = max4(negateBorderDistance);
      vec4 borderWeight = step(maxWeight, negateBorderDistance);

      vec4 insideBorder;

      if(all(lessThan(v_outsideDistance.xw, borderRadius.xx))) {
          dist = radiusDistance(borderRadius.x, v_outsideDistance.xw, v_borderDistance.xw, borderSize.xw);
          
          float tmp = borderRadius.x - borderSize.w;
          vec2 xIntersection = vec2(tmp, tmp / ratio);
          tmp = borderRadius.x - borderSize.x;
          vec2 yIntersection = vec2(tmp * ratio, tmp);
          vec2 lineIntersection = min(xIntersection, yIntersection);

          insideBorder.yz = vec2(0.0);
          insideBorder.xw = max(vec2(0.0), lineIntersection - v_borderDistance.xw);

      } else if(all(lessThan(v_outsideDistance.xy, borderRadius.yy))) {
          dist = radiusDistance(borderRadius.y, v_outsideDistance.xy, v_borderDistance.xy, borderSize.xy);

          float tmp = borderRadius.y - borderSize.y;
          vec2 xIntersection = vec2(tmp, tmp / ratio);
          tmp = borderRadius.y - borderSize.x;
          vec2 yIntersection = vec2(tmp * ratio, tmp);
          vec2 lineIntersection = min(xIntersection, yIntersection);

          insideBorder.zw = vec2(0.0);
          insideBorder.xy = max(vec2(0.0), lineIntersection - v_borderDistance.xy);

      } else if(all(lessThan(v_outsideDistance.zy, borderRadius.zz))) {
          dist = radiusDistance(borderRadius.z, v_outsideDistance.zy, v_borderDistance.zy, borderSize.zy);

          float tmp = borderRadius.z - borderSize.y;
          vec2 xIntersection = vec2(tmp, tmp / ratio);
          tmp = borderRadius.z - borderSize.z;
          vec2 yIntersection = vec2(tmp * ratio, tmp);
          vec2 lineIntersection = min(xIntersection, yIntersection);

          insideBorder.xw = vec2(0.0);
          insideBorder.zy =max(vec2(0.0), lineIntersection - v_borderDistance.zy);

      } else if(all(lessThan(v_outsideDistance.zw, borderRadius.ww))) {
          dist = radiusDistance(borderRadius.w, v_outsideDistance.zw, v_borderDistance.zw, borderSize.zw);

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
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    ` #include <normal_fragment_maps>
      vec3 b = normalize(vBitangent);
      vec3 t = normalize(vTangent);
      mat4 directions = mat4(vec4(b, 1.0), vec4(t, 1.0), vec4(-b, 1.0), vec4(-t, 1.0));
      float currentBorderSize = dist.x - dist.y;
      float outsideNormalWeight = currentBorderSize < 0.00001 ? 0.0 : max(0.0, -dist.y / currentBorderSize) * borderBend;
      vec3 outsideNormal = (borderWeight * transpose(directions)).xyz;
      normal = normalize(outsideNormalWeight * outsideNormal + (1.0 - outsideNormalWeight) * normal);
    `,
  )
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <color_fragment>',
    ` #include <color_fragment>
                
      float ddx = fwidth(dist.x);
      float outer = smoothstep(-ddx, ddx, dist.x);
  
      float ddy = fwidth(dist.y);
      float inner = smoothstep(-ddy, ddy, dist.y);
  
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
  
      diffuseColor.rgb = mix(borderColor, diffuseColor.rgb * backgroundColor, transition);
  
      diffuseColor.a = ${
        instanced ? 'clipOpacity * ' : ''
      } outer * mix(borderOpacity, diffuseColor.a * backgroundOpacity, transition);
      
            `,
  )
}
