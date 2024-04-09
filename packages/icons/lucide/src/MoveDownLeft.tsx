
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveDownLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-down-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.640 4.068 C 18.483 4.121,17.678 4.910,12.231 10.353 L 6.003 16.576 5.991 14.638 L 5.980 12.700 5.871 12.514 C 5.479 11.848,4.521 11.848,4.129 12.514 L 4.020 12.700 4.009 15.940 C 3.999 18.874,4.004 19.196,4.064 19.354 C 4.155 19.595,4.343 19.796,4.580 19.906 L 4.780 19.999 7.980 19.998 C 10.549 19.997,11.210 19.986,11.330 19.943 C 11.551 19.864,11.744 19.702,11.869 19.489 C 11.964 19.328,11.980 19.256,11.980 19.000 C 11.980 18.746,11.963 18.672,11.872 18.516 C 11.813 18.415,11.698 18.282,11.618 18.221 C 11.337 18.007,11.265 18.000,9.264 18.000 L 7.420 18.000 13.626 11.790 C 17.040 8.375,19.865 5.517,19.905 5.440 C 19.957 5.341,19.979 5.212,19.979 5.000 C 19.980 4.745,19.964 4.672,19.872 4.516 C 19.617 4.083,19.122 3.903,18.640 4.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveDownLeft = /*@__PURE__*/ forwardRef<ComponentInternals, MoveDownLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    