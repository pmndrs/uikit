
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.640 7.068 C 5.486 7.121,5.148 7.441,3.326 9.255 C 1.001 11.569,1.001 11.569,1.001 12.000 C 1.001 12.429,1.004 12.433,3.306 14.726 C 4.469 15.884,5.483 16.865,5.560 16.905 C 5.659 16.957,5.788 16.979,6.000 16.979 C 6.258 16.980,6.327 16.964,6.492 16.867 C 6.714 16.737,6.901 16.498,6.965 16.264 C 7.019 16.061,6.989 15.733,6.899 15.555 C 6.862 15.481,6.289 14.876,5.626 14.210 L 4.422 13.000 13.301 12.998 C 20.614 12.997,22.206 12.987,22.330 12.943 C 22.551 12.864,22.744 12.702,22.869 12.489 C 22.964 12.328,22.980 12.256,22.980 12.000 C 22.980 11.746,22.963 11.672,22.872 11.516 C 22.740 11.293,22.533 11.128,22.290 11.055 C 22.138 11.009,20.641 11.000,13.265 11.000 L 4.422 11.000 5.626 9.790 C 6.289 9.125,6.864 8.517,6.905 8.440 C 6.957 8.341,6.979 8.213,6.979 8.000 C 6.980 7.745,6.964 7.672,6.872 7.516 C 6.617 7.083,6.121 6.903,5.640 7.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveLeft = /*@__PURE__*/ forwardRef<ComponentInternals, MoveLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    