
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type PlusProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-plus" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.695 4.057 C 11.466 4.129,11.256 4.299,11.128 4.516 L 11.020 4.700 11.009 7.850 L 10.998 11.000 7.945 11.000 C 4.633 11.000,4.675 10.997,4.382 11.221 C 4.302 11.282,4.187 11.415,4.128 11.516 C 4.037 11.672,4.020 11.746,4.020 12.000 C 4.020 12.256,4.036 12.328,4.131 12.489 C 4.256 12.702,4.449 12.864,4.670 12.943 C 4.790 12.986,5.433 12.997,7.909 12.998 L 10.998 13.000 11.009 16.153 L 11.020 19.306 11.141 19.503 C 11.543 20.156,12.457 20.156,12.859 19.503 L 12.980 19.306 12.991 16.153 L 13.002 13.000 16.091 12.998 C 18.567 12.997,19.210 12.986,19.330 12.943 C 19.551 12.864,19.744 12.702,19.869 12.489 C 19.964 12.328,19.980 12.256,19.980 12.000 C 19.980 11.746,19.963 11.672,19.872 11.516 C 19.813 11.415,19.698 11.282,19.618 11.221 C 19.325 10.997,19.367 11.000,16.055 11.000 L 13.002 11.000 12.991 7.850 L 12.980 4.700 12.872 4.516 C 12.628 4.101,12.150 3.915,11.695 4.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Plus = /*@__PURE__*/ forwardRef<ComponentInternals, PlusProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    