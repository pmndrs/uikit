
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SkipForwardProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-skip-forward" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.695 3.055 C 4.464 3.130,4.255 3.300,4.128 3.516 L 4.020 3.700 4.010 11.914 C 4.003 17.333,4.013 20.180,4.040 20.278 C 4.099 20.498,4.291 20.739,4.508 20.867 C 4.673 20.964,4.743 20.980,5.000 20.980 C 5.234 20.980,5.332 20.961,5.444 20.895 C 5.524 20.848,7.884 18.973,10.689 16.729 C 16.412 12.150,15.981 12.537,15.979 11.980 C 15.979 11.757,15.959 11.664,15.879 11.523 C 15.797 11.377,14.889 10.633,10.680 7.264 C 7.875 5.019,5.510 3.147,5.424 3.104 C 5.228 3.006,4.911 2.985,4.695 3.055 M18.695 4.057 C 18.466 4.129,18.256 4.299,18.128 4.516 L 18.020 4.700 18.020 12.003 L 18.020 19.306 18.141 19.503 C 18.543 20.156,19.457 20.156,19.859 19.503 L 19.980 19.306 19.980 12.003 L 19.980 4.700 19.872 4.516 C 19.628 4.101,19.150 3.915,18.695 4.057 M13.360 12.000 C 13.360 12.018,11.704 13.357,9.680 14.976 L 6.000 17.920 6.000 12.000 L 6.000 6.080 9.680 9.024 C 11.704 10.643,13.360 11.982,13.360 12.000 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const SkipForward = /*@__PURE__*/ forwardRef<ComponentInternals, SkipForwardProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    