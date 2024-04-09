
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowUpLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-up-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.580 6.094 C 6.343 6.204,6.155 6.405,6.064 6.646 C 6.004 6.805,5.999 7.272,6.009 12.063 L 6.020 17.306 6.141 17.503 C 6.543 18.156,7.457 18.156,7.859 17.503 L 7.980 17.306 7.991 13.364 L 8.002 9.422 12.211 13.627 C 14.526 15.940,16.483 17.865,16.560 17.905 C 16.659 17.957,16.788 17.979,17.000 17.979 C 17.258 17.980,17.327 17.964,17.492 17.867 C 17.714 17.737,17.901 17.498,17.965 17.264 C 18.019 17.062,17.989 16.734,17.899 16.555 C 17.862 16.481,15.939 14.526,13.626 12.210 L 9.421 8.000 13.300 7.998 C 16.437 7.997,17.209 7.986,17.330 7.943 C 17.551 7.864,17.744 7.702,17.869 7.489 C 17.964 7.328,17.980 7.256,17.980 7.000 C 17.980 6.746,17.963 6.672,17.872 6.516 C 17.740 6.293,17.533 6.128,17.290 6.055 C 17.139 6.010,16.204 6.000,11.944 6.000 L 6.780 6.001 6.580 6.094 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowUpLeft = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowUpLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    