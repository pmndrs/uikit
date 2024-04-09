
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type EqualProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-equal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.695 8.057 C 4.466 8.129,4.256 8.299,4.128 8.516 C 4.037 8.672,4.020 8.746,4.020 9.000 C 4.020 9.256,4.036 9.328,4.131 9.489 C 4.256 9.702,4.449 9.864,4.670 9.943 C 4.893 10.022,19.107 10.022,19.330 9.943 C 19.551 9.864,19.744 9.702,19.869 9.489 C 19.964 9.328,19.980 9.256,19.980 9.000 C 19.980 8.746,19.963 8.672,19.872 8.516 C 19.740 8.293,19.533 8.128,19.290 8.055 C 19.027 7.976,4.947 7.978,4.695 8.057 M4.695 14.057 C 4.466 14.129,4.256 14.299,4.128 14.516 C 4.037 14.672,4.020 14.746,4.020 15.000 C 4.020 15.256,4.036 15.328,4.131 15.489 C 4.256 15.702,4.449 15.864,4.670 15.943 C 4.893 16.022,19.107 16.022,19.330 15.943 C 19.551 15.864,19.744 15.702,19.869 15.489 C 19.964 15.328,19.980 15.256,19.980 15.000 C 19.980 14.746,19.963 14.672,19.872 14.516 C 19.740 14.293,19.533 14.128,19.290 14.055 C 19.027 13.976,4.947 13.978,4.695 14.057 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Equal = /*@__PURE__*/ forwardRef<ComponentInternals, EqualProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    