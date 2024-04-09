
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowDownLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-down-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.695 6.057 C 6.466 6.129,6.256 6.299,6.128 6.516 L 6.020 6.700 6.009 11.940 C 5.999 16.729,6.004 17.195,6.064 17.354 C 6.155 17.595,6.343 17.796,6.580 17.906 L 6.780 17.999 11.980 17.998 C 16.220 17.997,17.208 17.987,17.330 17.943 C 17.551 17.864,17.744 17.702,17.869 17.489 C 17.964 17.328,17.980 17.256,17.980 17.000 C 17.980 16.746,17.963 16.672,17.872 16.516 C 17.813 16.415,17.698 16.282,17.618 16.221 C 17.320 15.994,17.435 16.000,13.264 16.000 L 9.421 16.000 13.626 11.790 C 15.939 9.474,17.865 7.517,17.905 7.440 C 17.957 7.341,17.979 7.212,17.979 7.000 C 17.980 6.745,17.964 6.672,17.872 6.516 C 17.740 6.293,17.533 6.128,17.290 6.055 C 17.055 5.984,16.943 5.986,16.677 6.063 C 16.465 6.125,16.354 6.232,12.231 10.352 L 8.002 14.577 7.991 10.639 L 7.980 6.700 7.872 6.516 C 7.628 6.101,7.150 5.915,6.695 6.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowDownLeft = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowDownLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    