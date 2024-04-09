
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronDownProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.670 8.061 C 5.448 8.142,5.250 8.309,5.128 8.516 C 5.036 8.672,5.020 8.745,5.021 9.000 C 5.021 9.212,5.043 9.341,5.095 9.440 C 5.195 9.632,11.294 15.738,11.520 15.873 C 11.673 15.964,11.745 15.980,12.000 15.979 C 12.212 15.979,12.341 15.957,12.440 15.905 C 12.632 15.805,18.738 9.706,18.873 9.480 C 18.964 9.328,18.980 9.254,18.980 9.000 C 18.980 8.746,18.963 8.672,18.872 8.516 C 18.618 8.084,18.138 7.906,17.657 8.065 C 17.478 8.125,17.210 8.380,14.730 10.854 L 12.000 13.578 9.270 10.854 C 6.790 8.380,6.522 8.125,6.343 8.065 C 6.107 7.987,5.874 7.986,5.670 8.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronDown = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronDownProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    