
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronLastProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-last" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.670 5.061 C 6.448 5.142,6.250 5.309,6.128 5.516 C 6.036 5.672,6.020 5.745,6.021 6.000 C 6.021 6.212,6.043 6.341,6.095 6.440 C 6.135 6.517,7.386 7.800,8.874 9.290 L 11.579 12.000 8.874 14.710 C 7.386 16.200,6.135 17.483,6.095 17.560 C 6.043 17.659,6.021 17.788,6.021 18.000 C 6.020 18.258,6.036 18.327,6.133 18.492 C 6.263 18.714,6.502 18.901,6.736 18.965 C 6.938 19.019,7.266 18.989,7.445 18.899 C 7.630 18.807,13.737 12.707,13.873 12.480 C 13.964 12.328,13.980 12.254,13.980 12.000 C 13.980 11.746,13.964 11.672,13.873 11.520 C 13.812 11.417,12.431 10.008,10.653 8.235 C 7.817 5.407,7.522 5.125,7.343 5.065 C 7.107 4.987,6.874 4.986,6.670 5.061 M16.695 5.057 C 16.466 5.129,16.256 5.299,16.128 5.516 L 16.020 5.700 16.020 12.003 L 16.020 18.306 16.141 18.503 C 16.543 19.156,17.457 19.156,17.859 18.503 L 17.980 18.306 17.980 12.003 L 17.980 5.700 17.872 5.516 C 17.628 5.101,17.150 4.915,16.695 5.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronLast = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronLastProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    