
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type StepForwardProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-step-forward" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.695 3.057 C 5.466 3.129,5.256 3.299,5.128 3.516 L 5.020 3.700 5.020 12.003 L 5.020 20.306 5.141 20.503 C 5.543 21.156,6.457 21.156,6.859 20.503 L 6.980 20.306 6.980 12.003 L 6.980 3.700 6.872 3.516 C 6.628 3.101,6.150 2.915,5.695 3.057 M9.695 3.055 C 9.464 3.130,9.255 3.300,9.128 3.516 L 9.020 3.700 9.010 11.914 C 9.003 17.333,9.013 20.180,9.040 20.278 C 9.099 20.498,9.291 20.739,9.508 20.867 C 9.673 20.964,9.743 20.980,10.000 20.980 C 10.234 20.980,10.332 20.961,10.444 20.895 C 10.524 20.848,12.884 18.973,15.689 16.729 C 21.412 12.150,20.981 12.537,20.979 11.980 C 20.979 11.757,20.959 11.664,20.879 11.523 C 20.797 11.377,19.889 10.633,15.680 7.264 C 12.875 5.019,10.510 3.147,10.424 3.104 C 10.228 3.006,9.911 2.985,9.695 3.055 M18.360 12.000 C 18.360 12.018,16.704 13.357,14.680 14.976 L 11.000 17.920 11.000 12.000 L 11.000 6.080 14.680 9.024 C 16.704 10.643,18.360 11.982,18.360 12.000 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const StepForward = /*@__PURE__*/ forwardRef<ComponentInternals, StepForwardProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    