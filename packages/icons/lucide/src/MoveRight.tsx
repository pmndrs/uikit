
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.670 7.061 C 17.448 7.142,17.250 7.309,17.128 7.516 C 17.036 7.672,17.020 7.745,17.021 8.000 C 17.021 8.213,17.043 8.341,17.095 8.440 C 17.136 8.517,17.711 9.125,18.374 9.790 L 19.578 11.000 10.735 11.000 C 3.359 11.000,1.862 11.009,1.710 11.055 C 1.467 11.128,1.260 11.293,1.128 11.516 C 1.037 11.672,1.020 11.746,1.020 12.000 C 1.020 12.256,1.036 12.328,1.131 12.489 C 1.256 12.702,1.449 12.864,1.670 12.943 C 1.794 12.987,3.386 12.997,10.699 12.998 L 19.578 13.000 18.374 14.210 C 17.711 14.876,17.138 15.481,17.101 15.555 C 16.872 16.009,17.056 16.601,17.508 16.867 C 17.673 16.964,17.742 16.980,18.000 16.979 C 18.212 16.979,18.341 16.957,18.440 16.905 C 18.517 16.865,19.531 15.884,20.694 14.726 C 22.996 12.433,22.999 12.429,22.999 12.000 C 22.999 11.569,22.999 11.569,20.674 9.255 C 18.750 7.340,18.521 7.124,18.343 7.065 C 18.107 6.987,17.874 6.986,17.670 7.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveRight = /*@__PURE__*/ forwardRef<ComponentInternals, MoveRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    