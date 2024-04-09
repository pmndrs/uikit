
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowDownRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-down-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.695 6.057 C 6.466 6.129,6.256 6.299,6.128 6.516 C 6.036 6.672,6.020 6.745,6.021 7.000 C 6.021 7.212,6.043 7.341,6.095 7.440 C 6.135 7.517,8.061 9.474,10.374 11.790 L 14.579 16.000 10.736 16.000 C 6.565 16.000,6.680 15.994,6.382 16.221 C 6.302 16.282,6.187 16.415,6.128 16.516 C 6.037 16.672,6.020 16.746,6.020 17.000 C 6.020 17.256,6.036 17.328,6.131 17.489 C 6.256 17.702,6.449 17.864,6.670 17.943 C 6.792 17.987,7.780 17.997,12.020 17.998 L 17.220 17.999 17.420 17.906 C 17.657 17.796,17.845 17.595,17.936 17.354 C 17.996 17.195,18.001 16.729,17.991 11.940 L 17.980 6.700 17.871 6.514 C 17.479 5.848,16.521 5.848,16.129 6.514 L 16.020 6.700 16.009 10.639 L 15.998 14.577 11.769 10.352 C 7.646 6.232,7.535 6.125,7.323 6.063 C 7.066 5.988,6.919 5.987,6.695 6.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowDownRight = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowDownRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    