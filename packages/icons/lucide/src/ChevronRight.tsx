
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.670 5.061 C 8.448 5.142,8.250 5.309,8.128 5.516 C 8.036 5.672,8.020 5.745,8.021 6.000 C 8.021 6.212,8.043 6.341,8.095 6.440 C 8.135 6.517,9.386 7.800,10.874 9.290 L 13.579 12.000 10.874 14.710 C 9.386 16.200,8.135 17.483,8.095 17.560 C 8.043 17.659,8.021 17.788,8.021 18.000 C 8.020 18.258,8.036 18.327,8.133 18.492 C 8.263 18.714,8.502 18.901,8.736 18.965 C 8.938 19.019,9.266 18.989,9.445 18.899 C 9.630 18.807,15.737 12.707,15.873 12.480 C 15.964 12.328,15.980 12.254,15.980 12.000 C 15.980 11.746,15.964 11.672,15.873 11.520 C 15.812 11.417,14.431 10.008,12.653 8.235 C 9.817 5.407,9.522 5.125,9.343 5.065 C 9.107 4.987,8.874 4.986,8.670 5.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronRight = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    