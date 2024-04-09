
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowDownProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.695 4.057 C 11.466 4.129,11.256 4.299,11.128 4.516 L 11.020 4.700 11.009 10.639 L 10.999 16.577 8.269 13.852 C 5.628 11.215,5.533 11.125,5.323 11.064 C 5.057 10.986,4.945 10.984,4.710 11.055 C 4.467 11.128,4.260 11.293,4.128 11.516 C 4.036 11.672,4.020 11.745,4.021 12.000 C 4.021 12.212,4.043 12.341,4.095 12.440 C 4.135 12.517,5.791 14.206,7.774 16.194 C 11.688 20.117,11.557 19.999,12.000 19.999 C 12.443 19.999,12.312 20.117,16.226 16.194 C 18.209 14.206,19.865 12.517,19.905 12.440 C 19.957 12.341,19.979 12.212,19.979 12.000 C 19.980 11.745,19.964 11.672,19.872 11.516 C 19.740 11.293,19.533 11.128,19.290 11.055 C 19.055 10.984,18.943 10.986,18.677 11.064 C 18.467 11.125,18.372 11.215,15.731 13.852 L 13.001 16.577 12.991 10.639 L 12.980 4.700 12.872 4.516 C 12.628 4.101,12.150 3.915,11.695 4.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowDown = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowDownProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    