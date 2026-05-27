import type { WebGLProgramParametersWithUniforms } from 'three'
import { getInstancedClippingFragment } from '../../clipping-shader.js'

export function compilePanelDepthMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  compilePanelClippingMaterial(parameters, instanced)
  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    `#include <clipping_planes_fragment>
    ${getFragmentOpacityCode(instanced, undefined)}
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
        float(packedBorderRadius / 125000 % 50),
        float(packedBorderRadius / 2500 % 50),
        float(packedBorderRadius / 50 % 50),
        float(packedBorderRadius % 50)
      ) * 0.01;`,
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

  parameters.fragmentShader = getFragmentShaderPrefix(instanced) + parameters.fragmentShader

  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    getClippingPlanesFragment(instanced),
  )
}

function getFragmentShaderPrefix(instanced: boolean): string {
  return `${instanced ? 'in' : 'uniform'} highp mat4 data;
    in vec4 borderRadius;
    ${
      instanced
        ? `
    in vec3 localPosition;
    in mat4 clipping;`
        : ''
    }

    float min4(vec4 v) {
        vec2 tmp = min(v.xy, v.zw);
        return min(tmp.x, tmp.y);
    }
    
    float max4(vec4 v) {
        vec2 tmp = max(v.xy, v.zw);
        return max(tmp.x, tmp.y);
    }
    
    vec2 radiusDistance(float radius, vec2 outside, vec2 border, vec2 borderSize) {
        vec2 outerRadius = vec2(radius);
        vec2 innerRadius = outerRadius - borderSize;
        
        vec2 radiusWeightUnnorm = abs(innerRadius - border);
        float sum = radiusWeightUnnorm.x + radiusWeightUnnorm.y;
        vec2 radiusWeight = sum > 0.0 ? radiusWeightUnnorm / sum : vec2(0.5);
        
        return vec2(
            radius - distance(outside, outerRadius),
            dot(radiusWeight, innerRadius) - distance(border, innerRadius)
        );
    }
    
    vec2 calculateCornerIntersection(float cornerRadius, vec2 borderSizes, float aspectRatio) {
        float tmp1 = cornerRadius - borderSizes.y;
        vec2 xIntersection = vec2(tmp1, tmp1 / aspectRatio);
        
        float tmp2 = cornerRadius - borderSizes.x;
        vec2 yIntersection = vec2(tmp2 * aspectRatio, tmp2);
        
        return min(xIntersection, yIntersection);
    }
    `
}

function getClippingPlanesFragment(instanced: boolean): string {
  const instancedClipping = instanced ? getInstancedClippingFragment() : ''

  return ` ${instancedClipping}
        
        vec4 absoluteBorderSize = data[0];
        vec3 backgroundColor = data[1].xyz;
        float backgroundOpacity = data[1].w;
        vec3 borderColor = data[2].yzw;
        float borderOpacity = data[3].x;
        float borderBend = data[3].y;
        vec2 dimensions = data[3].zw;
        
        float aspectRatio = dimensions.x / dimensions.y;
        vec4 borderSize = absoluteBorderSize / dimensions.yyyy;
        
        vec2 uvFlipped = vec2(vUv.x, 1.0 - vUv.y);
        vec4 v_outsideDistance = vec4(
            uvFlipped.y,
            (1.0 - uvFlipped.x) * aspectRatio,
            1.0 - uvFlipped.y,
            uvFlipped.x * aspectRatio
        );
        vec4 v_borderDistance = v_outsideDistance - borderSize;
  
        vec2 distance = vec2(min4(v_outsideDistance), min4(v_borderDistance));
        
        vec4 negateBorderDistance = vec4(1.0) - v_borderDistance;
        float maxWeight = max4(negateBorderDistance);
        vec4 borderWeight = step(maxWeight, negateBorderDistance);
  
        vec4 insideBorder = vec4(0.0);
        
        vec2 cornerPos;
        float cornerRadius;
        vec2 cornerBorderSizes;
        
        if (all(lessThan(v_outsideDistance.wx, borderRadius.xx))) {
            cornerPos = v_outsideDistance.wx;
            cornerRadius = borderRadius.x;
            cornerBorderSizes = borderSize.wx;
            distance = radiusDistance(cornerRadius, cornerPos, v_borderDistance.wx, cornerBorderSizes);
            
            vec2 lineIntersection = calculateCornerIntersection(cornerRadius, cornerBorderSizes, aspectRatio);
            insideBorder.wx = max(vec2(0.0), lineIntersection - v_borderDistance.wx);
        }
        else if (all(lessThan(v_outsideDistance.yx, borderRadius.yy))) {
            cornerPos = v_outsideDistance.yx;
            cornerRadius = borderRadius.y;
            cornerBorderSizes = borderSize.yx;
            distance = radiusDistance(cornerRadius, cornerPos, v_borderDistance.yx, cornerBorderSizes);
            
            vec2 lineIntersection = calculateCornerIntersection(cornerRadius, cornerBorderSizes, aspectRatio);
            insideBorder.yx = max(vec2(0.0), lineIntersection - v_borderDistance.yx);
        }
        else if (all(lessThan(v_outsideDistance.yz, borderRadius.zz))) {
            cornerPos = v_outsideDistance.yz;
            cornerRadius = borderRadius.z;
            cornerBorderSizes = borderSize.yz;
            distance = radiusDistance(cornerRadius, cornerPos, v_borderDistance.yz, cornerBorderSizes);
            
            vec2 lineIntersection = calculateCornerIntersection(cornerRadius, cornerBorderSizes, aspectRatio);
            insideBorder.yz = max(vec2(0.0), lineIntersection - v_borderDistance.yz);
        }
        else if (all(lessThan(v_outsideDistance.zw, borderRadius.ww))) {
            cornerPos = v_outsideDistance.zw;
            cornerRadius = borderRadius.w;
            cornerBorderSizes = borderSize.zw;
            distance = radiusDistance(cornerRadius, cornerPos, v_borderDistance.zw, cornerBorderSizes);
            
            vec2 lineIntersection = calculateCornerIntersection(cornerRadius, cornerBorderSizes, aspectRatio);
            insideBorder.zw = max(vec2(0.0), lineIntersection - v_borderDistance.zw);
        }
  
        float insideBorderSum = dot(insideBorder, vec4(1.0));
        if (insideBorderSum > 0.0) {
          borderWeight = insideBorder / insideBorderSum;
        }
  
        #include <clipping_planes_fragment>`
}

function getFragmentOpacityCode(instanced: boolean, existingOpacity: string | undefined) {
  return `vec2 distanceGradient = fwidth(distance);
  float outer = smoothstep(-distanceGradient.x, distanceGradient.x, distance.x);
  float inner = smoothstep(-distanceGradient.y, distanceGradient.y, distance.y);

  float transition = 1.0 - step(0.1, outer - inner) * (1.0 - inner);

  float fullBackgroundOpacity = ${existingOpacity == null ? '' : `${existingOpacity} * `}backgroundOpacity;
  float fullBorderOpacity = min(1.0, borderOpacity + fullBackgroundOpacity);

  float outOpacity = ${instanced ? 'clipOpacity * ' : ''}outer * mix(fullBorderOpacity, fullBackgroundOpacity, transition);

  if (outOpacity < 0.01) {
    discard;
  }`
}

export function compilePanelMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean) {
  compilePanelClippingMaterial(parameters, instanced)

  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <color_fragment>',
    ` #include <color_fragment>
      ${getFragmentOpacityCode(instanced, 'diffuseColor.a')}
      
      vec3 mainColor = diffuseColor.rgb * backgroundColor;
      float borderMix = borderOpacity / max(fullBorderOpacity, 0.001);
      diffuseColor.rgb = mix(mix(mainColor, borderColor, borderMix), mainColor, transition);
      diffuseColor.a = outOpacity;
      `,
  )

  parameters.fragmentShader = parameters.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    ` #include <normal_fragment_maps>
      
      vec3 bitangent = normalize(vBitangent);
      vec3 tangent = normalize(vTangent);
      
      mat4 directions = mat4(
        vec4(bitangent, 1.0), 
        vec4(tangent, 1.0), 
        vec4(-bitangent, 1.0), 
        vec4(-tangent, 1.0)
      );
      
      float currentBorderSize = distance.x - distance.y;
      float outsideNormalWeight = currentBorderSize < 1e-5 ? 0.0 : 
        max(0.0, -distance.y / currentBorderSize) * -borderBend;
      
      vec3 outsideNormal = (borderWeight * transpose(directions)).xyz;
      normal = normalize(mix(normal, outsideNormal, outsideNormalWeight));
    `,
  )
}
