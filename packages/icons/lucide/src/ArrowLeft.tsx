
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.640 4.068 C 11.484 4.121,10.975 4.613,7.826 7.755 C 3.881 11.690,4.001 11.557,4.001 12.000 C 4.001 12.443,3.883 12.312,7.806 16.226 C 9.794 18.209,11.481 19.862,11.555 19.899 C 12.010 20.128,12.601 19.944,12.867 19.492 C 12.964 19.327,12.980 19.258,12.979 19.000 C 12.979 18.788,12.957 18.659,12.905 18.560 C 12.865 18.483,11.614 17.201,10.126 15.710 L 7.421 13.000 13.300 12.998 C 18.108 12.997,19.207 12.987,19.330 12.943 C 19.551 12.864,19.744 12.702,19.869 12.489 C 19.964 12.328,19.980 12.256,19.980 12.000 C 19.980 11.746,19.963 11.672,19.872 11.516 C 19.740 11.293,19.533 11.128,19.290 11.055 C 19.139 11.009,18.099 11.000,13.264 11.000 L 7.421 11.000 10.126 8.290 C 11.614 6.800,12.865 5.517,12.905 5.440 C 12.957 5.341,12.979 5.212,12.979 5.000 C 12.980 4.745,12.964 4.672,12.872 4.516 C 12.617 4.083,12.122 3.903,11.640 4.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowLeft = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    