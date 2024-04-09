
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SpaceProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-space" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.695 16.057 C 1.466 16.129,1.256 16.299,1.128 16.516 C 1.023 16.695,1.020 16.720,1.007 17.428 C 0.992 18.249,1.024 18.474,1.210 18.849 C 1.359 19.150,1.807 19.612,2.103 19.769 C 2.566 20.016,1.900 20.000,12.000 20.000 C 22.100 20.000,21.434 20.016,21.897 19.769 C 22.193 19.612,22.641 19.150,22.790 18.849 C 22.976 18.474,23.008 18.249,22.993 17.428 C 22.980 16.718,22.977 16.695,22.871 16.514 C 22.479 15.848,21.521 15.848,21.129 16.514 C 21.026 16.691,21.019 16.733,21.000 17.340 L 20.980 17.980 11.993 17.990 L 3.007 18.000 2.993 17.350 C 2.981 16.728,2.975 16.692,2.872 16.516 C 2.628 16.101,2.150 15.915,1.695 16.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Space = /*@__PURE__*/ forwardRef<ComponentInternals, SpaceProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    