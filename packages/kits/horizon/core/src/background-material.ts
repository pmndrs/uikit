import { isDarkMode } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { MeshBasicMaterial } from 'three'

export const panelMaterialClass = computed(() => (isDarkMode.value ? DarkBackgroundMaterial : LightBackgroundMaterial))

/*
top: #414141
bottom: #272727
*/
export class DarkBackgroundMaterial extends MeshBasicMaterial {
  constructor() {
    super()
    this.customProgramCacheKey = () => 'DarkBackgroundMaterial-uvGradient-v1'

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
          `\n{\n  const vec3 topColor = vec3(0.2549019608, 0.2549019608, 0.2549019608);\n  const vec3 bottomColor = vec3(0.1529411765, 0.1529411765, 0.1529411765);\n  float t = clamp(vUv.y, 0.0, 1.0);\n  vec3 grad = mix(bottomColor, topColor, t);\n  gl_FragColor = vec4(grad, diffuseColor.a);\n}\n`,
        )
    }
  }
}

/*
top: #ffffff'
bottom: #f2f2f2'
*/
export class LightBackgroundMaterial extends MeshBasicMaterial {
  constructor() {
    super()
    this.customProgramCacheKey = () => 'LightBackgroundMaterial-uvGradient-v1'

    this.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n#define USE_UV`)

      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n#define USE_UV`)
        .replace(
          '#include <opaque_fragment>',
          `\n{\n  const vec3 topColor = vec3(1.0, 1.0, 1.0);\n  const vec3 bottomColor = vec3(0.9490196078, 0.9490196078, 0.9490196078);\n  float t = clamp(vUv.y, 0.0, 1.0);\n  vec3 grad = mix(bottomColor, topColor, t);\n  gl_FragColor = vec4(grad, diffuseColor.a);\n}\n`,
        )
    }
  }
}
