import { MeshBasicMaterial } from 'three'
import { Font } from '../font.js'

export class InstancedGlyphMaterial extends MeshBasicMaterial {
  constructor(font: Font) {
    super({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })

    this.onBeforeCompile = (parameters, renderer) => {
      font.page.anisotropy = renderer.capabilities.getMaxAnisotropy()
      parameters.uniforms.fontPage = { value: font.page }
      parameters.uniforms.pageSize = { value: [font.pageWidth, font.pageHeight] }
      parameters.uniforms.distanceRange = { value: font.distanceRange }
      parameters.vertexShader =
        `attribute vec4 instanceUVOffset;
        varying vec2 fontUv;
        attribute vec4 instanceRGBA;
        varying vec4 rgba;
        attribute mat4 instanceClipping;
        varying mat4 clipping;
        varying vec3 localPosition;
        attribute float instanceRenderSolid;
        varying float renderSolid;
        ` + parameters.vertexShader
      parameters.vertexShader = parameters.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
            fontUv = instanceUVOffset.xy + uv * instanceUVOffset.zw;
            rgba = instanceRGBA;
            clipping = instanceClipping;
            localPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
            renderSolid = instanceRenderSolid;`,
      )
      parameters.fragmentShader =
        `uniform sampler2D fontPage;
            uniform vec2 pageSize;
            uniform int distanceRange;
        varying vec2 fontUv;
        varying vec4 rgba;
        varying mat4 clipping;
        varying vec3 localPosition;
        varying float renderSolid;
        float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
        }
        float getDistance() {
            vec3 msdf = texture(fontPage, fontUv).rgb;
            return median(msdf.r, msdf.g, msdf.b);
        }
        ` + parameters.fragmentShader
      parameters.fragmentShader = parameters.fragmentShader.replace(
        '#include <map_fragment>',
        ` #include <map_fragment>
          vec4 plane;
          float distanceToPlane, distanceGradient;
          float clipOpacity = 1.0;
          for(int i = 0; i < 4; i++) {
            plane = clipping[ i ];
            distanceToPlane = dot( localPosition, plane.xyz ) + plane.w;
            distanceGradient = fwidth( distanceToPlane ) / 2.0;
            clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

            if ( clipOpacity == 0.0 ) discard;
          }
          // Distance to the edge of the glyph in texels.
          float dist = (getDistance() - 0.5) * float(distanceRange);

          // Calculate the antialiasing distance based on the number of texels per screen pixel.
          float aaDist = length(fwidth(fontUv * pageSize)) * 0.5;

          // Clamp the antialiasing distance to avoid excessive blurring.
          aaDist = clamp(aaDist, 0.0, float(distanceRange) * 0.5);

          float alpha = smoothstep(-aaDist, aaDist, dist);

          if (alpha <= 0.0 && renderSolid <= 0.5) discard;

          // Apply gamma correction to improve text appearance, or override for synthetic solid glyphs.
          float gamma = 1.3;
          alpha = renderSolid > 0.5 ? 1.0 : pow(alpha, 1.0 / gamma);

          diffuseColor.a *= clipOpacity * alpha;
          diffuseColor *= rgba;
            `,
      )
    }
  }
}
