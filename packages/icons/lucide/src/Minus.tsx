
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MinusProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-minus" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.695 11.057 C 4.466 11.129,4.256 11.299,4.128 11.516 C 4.037 11.672,4.020 11.746,4.020 12.000 C 4.020 12.256,4.036 12.328,4.131 12.489 C 4.256 12.702,4.449 12.864,4.670 12.943 C 4.893 13.022,19.107 13.022,19.330 12.943 C 19.551 12.864,19.744 12.702,19.869 12.489 C 19.964 12.328,19.980 12.256,19.980 12.000 C 19.980 11.746,19.963 11.672,19.872 11.516 C 19.740 11.293,19.533 11.128,19.290 11.055 C 19.027 10.976,4.947 10.978,4.695 11.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Minus = /*@__PURE__*/ forwardRef<ComponentInternals, MinusProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    