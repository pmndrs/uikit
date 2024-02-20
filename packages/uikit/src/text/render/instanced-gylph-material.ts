import { MeshBasicMaterial } from 'three'
import { Font } from '../font.js'

export class InstancedGlyphMaterial extends MeshBasicMaterial {
  constructor(font: Font) {
    super({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })

    this.onBeforeCompile = (parameters) => {
      parameters.uniforms.fontPage = { value: font.page }
      parameters.uniforms.pageSize = { value: [font.pageWidth, font.pageHeight] }
      parameters.uniforms.distanceRange = { value: font.distanceRange }
      parameters.uniforms.v_weight = { value: 0.3 }
      parameters.vertexShader =
        `attribute vec4 instanceUVOffset;
        varying vec2 fontUv;
        attribute vec4 instanceRGBA;
        varying vec4 rgba;
        attribute mat4 instanceClipping;
        varying mat4 clipping;
        varying vec3 localPosition;
        ` + parameters.vertexShader
      parameters.vertexShader = parameters.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
            fontUv = instanceUVOffset.xy + uv * instanceUVOffset.zw;
            rgba = instanceRGBA;
            clipping = instanceClipping;
            localPosition = (instanceMatrix * vec4(position, 1.0)).xyz;`,
      )
      parameters.fragmentShader =
        `uniform sampler2D fontPage;
            uniform vec2 pageSize;
            uniform int distanceRange;
            uniform float v_weight;
        varying vec2 fontUv;
        varying vec4 rgba;
        varying mat4 clipping; 
        varying vec3 localPosition;
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
            distanceToPlane = - dot( -localPosition, plane.xyz ) + plane.w;
            distanceGradient = fwidth( distanceToPlane ) / 2.0;
            clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
      
            if ( clipOpacity == 0.0 ) discard;
          }
          vec2 dxdy = fwidth(fontUv) * pageSize;
          float dist = getDistance() + min(float(v_weight), 0.5 - 1.0 / float(distanceRange)) - 0.5;
          float multiplier = clamp(dist * float(distanceRange) / length(dxdy) + 0.5, 0.0, 1.0);
          if(multiplier <= 0.5) {
              discard;
          }
          diffuseColor.a *= clipOpacity * min((multiplier - 0.5) / 0.5, 1.0);
          diffuseColor *= rgba;
            `,
      )
    }
  }
}
