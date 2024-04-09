
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.640 5.068 C 14.485 5.121,14.036 5.553,11.347 8.235 C 9.570 10.008,8.188 11.417,8.127 11.520 C 8.036 11.672,8.020 11.746,8.020 12.000 C 8.020 12.254,8.036 12.328,8.127 12.480 C 8.263 12.707,14.370 18.807,14.555 18.899 C 15.010 19.128,15.601 18.944,15.867 18.492 C 15.964 18.327,15.980 18.258,15.979 18.000 C 15.979 17.788,15.957 17.659,15.905 17.560 C 15.865 17.483,14.614 16.200,13.126 14.710 L 10.421 12.000 13.126 9.290 C 14.614 7.800,15.865 6.517,15.905 6.440 C 15.957 6.341,15.979 6.212,15.979 6.000 C 15.980 5.745,15.964 5.672,15.872 5.516 C 15.617 5.083,15.122 4.903,14.640 5.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronLeft = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    