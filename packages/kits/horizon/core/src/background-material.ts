import { isDarkMode } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Color, MeshBasicMaterial } from 'three'

export const panelMaterialClass = computed(() => (isDarkMode.value ? DarkBackgroundMaterial : LightBackgroundMaterial))

export class DarkBackgroundMaterial extends MeshBasicMaterial {
  constructor() {
    super()
    this.customProgramCacheKey = () => 'DarkBackgroundMaterial-uvGradient-v1'
    const topColor = new Color('#414141')
    const bottomColor = new Color('#272727')
    this.onBeforeCompile = (paramerters, renderer) => {
      super.onBeforeCompile(paramerters, renderer)
      paramerters.vertexShader = paramerters.vertexShader.replace(
        '#include <common>',
        `#include <common>\n#define USE_UV`,
      )

      paramerters.fragmentShader = paramerters.fragmentShader
        .replace('#include <common>', `#include <common>\n#define USE_UV`)
        .replace(
          '#include <opaque_fragment>',
          `\n{\n  const vec3 topColor = vec3(${topColor.r}, ${topColor.g}, ${topColor.b});\n  const vec3 bottomColor = vec3(${bottomColor.r}, ${bottomColor.g}, ${bottomColor.b});\n  float t = clamp(vUv.y, 0.0, 1.0);\n  vec3 grad = mix(bottomColor, topColor, t);\n  gl_FragColor = vec4(grad, diffuseColor.a);\n}\n`,
        )
    }
  }
}

export class LightBackgroundMaterial extends MeshBasicMaterial {
  constructor() {
    super()
    this.customProgramCacheKey = () => 'LightBackgroundMaterial-uvGradient-v1'

    const topColor = new Color('#ffffff')
    const bottomColor = new Color('#f2f2f2')
    this.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n#define USE_UV`)

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n#define USE_UV`)
        .replace(
          '#include <opaque_fragment>',
          `\n{\n  const vec3 topColor = vec3(${topColor.r}, ${topColor.g}, ${topColor.b});\n  const vec3 bottomColor = vec3(${bottomColor.r}, ${bottomColor.g}, ${bottomColor.b});\n  float t = clamp(vUv.y, 0.0, 1.0);\n  vec3 grad = mix(bottomColor, topColor, t);\n  gl_FragColor = vec4(grad, diffuseColor.a);\n}\n`,
        )
    }
  }
}
