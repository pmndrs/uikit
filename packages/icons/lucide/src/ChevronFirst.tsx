
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronFirstProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-first" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.695 5.057 C 6.466 5.129,6.256 5.299,6.128 5.516 L 6.020 5.700 6.020 12.003 L 6.020 18.306 6.141 18.503 C 6.543 19.156,7.457 19.156,7.859 18.503 L 7.980 18.306 7.980 12.003 L 7.980 5.700 7.872 5.516 C 7.628 5.101,7.150 4.915,6.695 5.057 M16.640 5.068 C 16.485 5.121,16.036 5.553,13.347 8.235 C 11.570 10.008,10.188 11.417,10.127 11.520 C 10.036 11.672,10.020 11.746,10.020 12.000 C 10.020 12.254,10.036 12.328,10.127 12.480 C 10.263 12.707,16.370 18.807,16.555 18.899 C 17.010 19.128,17.601 18.944,17.867 18.492 C 17.964 18.327,17.980 18.258,17.979 18.000 C 17.979 17.788,17.957 17.659,17.905 17.560 C 17.865 17.483,16.614 16.200,15.126 14.710 L 12.421 12.000 15.126 9.290 C 16.614 7.800,17.865 6.517,17.905 6.440 C 17.957 6.341,17.979 6.212,17.979 6.000 C 17.980 5.745,17.964 5.672,17.872 5.516 C 17.617 5.083,17.122 4.903,16.640 5.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronFirst = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronFirstProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    