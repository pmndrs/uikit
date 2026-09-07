export function getInstancedClippingFragment(): string {
  return `
        vec4 clipPlane0 = clipping[0];
        vec4 clipPlane1 = clipping[1];
        vec4 clipPlane2 = clipping[2];
        vec4 clipPlane3 = clipping[3];
        bool clipPlane0Packed = clipPlane0.z > 1.5;
        bool clipPlane1Packed = clipPlane1.z > 1.5;
        bool clipPlane2Packed = clipPlane2.z > 1.5;
        bool clipPlane3Packed = clipPlane3.z > 1.5;
        vec3 clipNormal0 = vec3(clipPlane0.xy, clipPlane0Packed ? 0.0 : clipPlane0.z);
        vec3 clipNormal1 = vec3(clipPlane1.xy, clipPlane1Packed ? 0.0 : clipPlane1.z);
        vec3 clipNormal2 = vec3(clipPlane2.xy, clipPlane2Packed ? 0.0 : clipPlane2.z);
        vec3 clipNormal3 = vec3(clipPlane3.xy, clipPlane3Packed ? 0.0 : clipPlane3.z);
        float clipDistBot = dot(localPosition, clipNormal0) + clipPlane0.w;
        float clipDistLeft = dot(localPosition, clipNormal1) + clipPlane1.w;
        float clipDistTop = dot(localPosition, clipNormal2) + clipPlane2.w;
        float clipDistRight = dot(localPosition, clipNormal3) + clipPlane3.w;

        float clipOpacity = 1.0;
        float clipGradient0 = max(fwidth(clipDistBot) * 0.5, 0.00001);
        float clipGradient1 = max(fwidth(clipDistLeft) * 0.5, 0.00001);
        float clipGradient2 = max(fwidth(clipDistTop) * 0.5, 0.00001);
        float clipGradient3 = max(fwidth(clipDistRight) * 0.5, 0.00001);
        clipOpacity *= smoothstep(-clipGradient0, clipGradient0, clipDistBot);
        clipOpacity *= smoothstep(-clipGradient1, clipGradient1, clipDistLeft);
        clipOpacity *= smoothstep(-clipGradient2, clipGradient2, clipDistTop);
        clipOpacity *= smoothstep(-clipGradient3, clipGradient3, clipDistRight);
        if (clipOpacity < 0.01) discard;

        float clipRadiusTL = clipPlane2Packed ? clipPlane2.z - 2.0 : 0.0;
        float clipRadiusTR = clipPlane3Packed ? clipPlane3.z - 2.0 : 0.0;
        float clipRadiusBR = clipPlane1Packed ? clipPlane1.z - 2.0 : 0.0;
        float clipRadiusBL = clipPlane0Packed ? clipPlane0.z - 2.0 : 0.0;
        float clipCornerOpacity = 1.0;
        if (clipRadiusTL > 0.0 && clipDistTop < clipRadiusTL && clipDistLeft < clipRadiusTL) {
          vec2 clipCornerDistance = vec2(clipRadiusTL - clipDistLeft, clipRadiusTL - clipDistTop);
          float clipArcDistance = clipRadiusTL - length(clipCornerDistance);
          float clipArcGradient = max(fwidth(clipArcDistance) * 0.5, 0.00001);
          clipCornerOpacity *= smoothstep(-clipArcGradient, clipArcGradient, clipArcDistance);
        }
        if (clipRadiusTR > 0.0 && clipDistTop < clipRadiusTR && clipDistRight < clipRadiusTR) {
          vec2 clipCornerDistance = vec2(clipRadiusTR - clipDistRight, clipRadiusTR - clipDistTop);
          float clipArcDistance = clipRadiusTR - length(clipCornerDistance);
          float clipArcGradient = max(fwidth(clipArcDistance) * 0.5, 0.00001);
          clipCornerOpacity *= smoothstep(-clipArcGradient, clipArcGradient, clipArcDistance);
        }
        if (clipRadiusBR > 0.0 && clipDistBot < clipRadiusBR && clipDistRight < clipRadiusBR) {
          vec2 clipCornerDistance = vec2(clipRadiusBR - clipDistRight, clipRadiusBR - clipDistBot);
          float clipArcDistance = clipRadiusBR - length(clipCornerDistance);
          float clipArcGradient = max(fwidth(clipArcDistance) * 0.5, 0.00001);
          clipCornerOpacity *= smoothstep(-clipArcGradient, clipArcGradient, clipArcDistance);
        }
        if (clipRadiusBL > 0.0 && clipDistBot < clipRadiusBL && clipDistLeft < clipRadiusBL) {
          vec2 clipCornerDistance = vec2(clipRadiusBL - clipDistLeft, clipRadiusBL - clipDistBot);
          float clipArcDistance = clipRadiusBL - length(clipCornerDistance);
          float clipArcGradient = max(fwidth(clipArcDistance) * 0.5, 0.00001);
          clipCornerOpacity *= smoothstep(-clipArcGradient, clipArcGradient, clipArcDistance);
        }
        clipOpacity *= clipCornerOpacity;
        if (clipOpacity < 0.01) discard;`
}
