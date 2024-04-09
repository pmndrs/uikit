
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type CornerUpLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-corner-up-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.640 3.068 C 8.485 3.121,8.090 3.498,5.826 5.755 C 2.961 8.609,3.001 8.564,3.001 9.000 C 3.001 9.435,2.964 9.393,5.806 12.226 C 7.244 13.659,8.481 14.862,8.555 14.899 C 9.010 15.128,9.601 14.944,9.867 14.492 C 9.964 14.327,9.980 14.258,9.979 14.000 C 9.979 13.788,9.957 13.659,9.905 13.560 C 9.865 13.483,9.064 12.650,8.126 11.709 L 6.420 9.998 11.480 10.009 L 16.540 10.020 16.861 10.121 C 17.824 10.425,18.576 11.179,18.878 12.139 L 18.979 12.460 18.999 16.383 L 19.020 20.306 19.141 20.503 C 19.543 21.156,20.457 21.156,20.859 20.503 L 20.980 20.306 20.980 16.343 C 20.980 12.662,20.975 12.356,20.907 12.040 C 20.497 10.126,19.086 8.633,17.240 8.162 C 16.644 8.009,16.298 8.000,11.292 8.000 L 6.421 8.000 8.126 6.290 C 9.064 5.350,9.865 4.517,9.905 4.440 C 9.957 4.341,9.979 4.212,9.979 4.000 C 9.980 3.745,9.964 3.672,9.872 3.516 C 9.617 3.083,9.122 2.903,8.640 3.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const CornerUpLeft = /*@__PURE__*/ forwardRef<ComponentInternals, CornerUpLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    