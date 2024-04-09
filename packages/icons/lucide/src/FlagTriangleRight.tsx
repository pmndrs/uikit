
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type FlagTriangleRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-flag-triangle-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.695 1.055 C 6.464 1.130,6.255 1.300,6.128 1.516 L 6.020 1.700 6.020 12.003 L 6.020 22.306 6.141 22.503 C 6.543 23.156,7.457 23.156,7.859 22.503 L 7.980 22.306 7.991 17.463 L 8.001 12.619 12.769 10.240 C 16.632 8.311,17.567 7.829,17.702 7.697 C 18.082 7.324,18.092 6.705,17.725 6.321 C 17.608 6.198,16.601 5.681,12.440 3.602 C 6.842 0.805,7.104 0.921,6.695 1.055 M11.380 5.310 C 13.217 6.228,14.720 6.989,14.720 7.000 C 14.720 7.020,8.059 10.360,8.020 10.360 C 8.009 10.360,8.000 8.848,8.000 7.000 C 8.000 5.152,8.009 3.640,8.020 3.640 C 8.031 3.640,9.543 4.391,11.380 5.310 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const FlagTriangleRight = /*@__PURE__*/ forwardRef<ComponentInternals, FlagTriangleRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    