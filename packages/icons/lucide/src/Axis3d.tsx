
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type Axis3dProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-axis-3d" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.695 3.057 C 3.466 3.129,3.256 3.299,3.128 3.516 L 3.020 3.700 3.009 11.940 C 2.999 19.510,3.003 20.194,3.064 20.354 C 3.155 20.595,3.342 20.795,3.580 20.906 L 3.780 20.999 11.980 20.998 C 18.727 20.997,20.207 20.987,20.330 20.943 C 20.551 20.864,20.744 20.702,20.869 20.489 C 20.964 20.328,20.980 20.256,20.980 20.000 C 20.980 19.746,20.963 19.672,20.872 19.516 C 20.740 19.293,20.533 19.128,20.290 19.055 C 20.138 19.009,18.947 19.000,13.264 19.000 L 6.421 19.000 9.126 16.290 C 10.614 14.800,11.865 13.517,11.905 13.440 C 11.957 13.341,11.979 13.212,11.979 13.000 C 11.980 12.745,11.964 12.672,11.872 12.516 C 11.618 12.084,11.138 11.906,10.657 12.065 C 10.478 12.125,10.210 12.380,7.730 14.854 L 5.001 17.577 4.990 10.639 L 4.980 3.700 4.872 3.516 C 4.628 3.101,4.150 2.915,3.695 3.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Axis3d = /*@__PURE__*/ forwardRef<ComponentInternals, Axis3dProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    