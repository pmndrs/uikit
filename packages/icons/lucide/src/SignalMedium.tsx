
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SignalMediumProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-signal-medium" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.695 11.057 C 11.466 11.129,11.256 11.299,11.128 11.516 L 11.020 11.700 11.020 16.003 L 11.020 20.306 11.141 20.503 C 11.543 21.156,12.457 21.156,12.859 20.503 L 12.980 20.306 12.980 16.003 L 12.980 11.700 12.872 11.516 C 12.628 11.101,12.150 10.915,11.695 11.057 M6.695 15.057 C 6.466 15.129,6.256 15.299,6.128 15.516 L 6.020 15.700 6.020 18.003 L 6.020 20.306 6.141 20.503 C 6.209 20.613,6.346 20.756,6.452 20.828 C 6.923 21.144,7.554 20.999,7.859 20.503 L 7.980 20.306 7.980 18.003 L 7.980 15.700 7.872 15.516 C 7.628 15.101,7.150 14.915,6.695 15.057 M1.695 19.055 C 1.464 19.130,1.255 19.300,1.128 19.516 C 1.037 19.672,1.020 19.746,1.020 20.000 C 1.020 20.257,1.036 20.327,1.133 20.492 C 1.651 21.374,2.998 21.018,2.998 20.000 C 2.998 19.623,2.792 19.281,2.463 19.112 C 2.265 19.010,1.911 18.984,1.695 19.055 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const SignalMedium = /*@__PURE__*/ forwardRef<ComponentInternals, SignalMediumProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    