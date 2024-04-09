
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveDownProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.695 1.057 C 11.466 1.129,11.256 1.299,11.128 1.516 L 11.020 1.700 11.010 10.638 L 10.999 19.575 9.770 18.354 C 8.688 17.279,8.516 17.124,8.343 17.066 C 7.863 16.905,7.382 17.084,7.128 17.516 C 7.036 17.672,7.020 17.745,7.021 18.000 C 7.021 18.212,7.043 18.341,7.095 18.440 C 7.135 18.517,8.116 19.531,9.274 20.694 C 11.567 22.996,11.571 22.999,12.000 22.999 C 12.429 22.999,12.433 22.996,14.726 20.694 C 15.884 19.531,16.865 18.517,16.905 18.440 C 16.957 18.341,16.979 18.212,16.979 18.000 C 16.980 17.745,16.964 17.672,16.872 17.516 C 16.618 17.084,16.137 16.905,15.657 17.066 C 15.484 17.124,15.312 17.279,14.230 18.354 L 13.001 19.575 12.990 10.638 L 12.980 1.700 12.872 1.516 C 12.628 1.101,12.150 0.915,11.695 1.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveDown = /*@__PURE__*/ forwardRef<ComponentInternals, MoveDownProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    