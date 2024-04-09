
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveDownRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-down-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.670 4.061 C 4.448 4.142,4.250 4.309,4.128 4.516 C 4.036 4.672,4.020 4.745,4.021 5.000 C 4.021 5.212,4.043 5.341,4.095 5.440 C 4.135 5.517,6.960 8.374,10.374 11.790 L 16.580 18.000 14.736 18.000 C 12.735 18.000,12.663 18.007,12.382 18.221 C 12.302 18.282,12.187 18.415,12.128 18.516 C 12.037 18.672,12.020 18.746,12.020 19.000 C 12.020 19.256,12.036 19.328,12.131 19.489 C 12.256 19.702,12.449 19.864,12.670 19.943 C 12.790 19.986,13.451 19.997,16.020 19.998 L 19.220 19.999 19.420 19.906 C 19.657 19.796,19.845 19.595,19.936 19.354 C 19.996 19.196,20.001 18.874,19.991 15.940 L 19.980 12.700 19.871 12.514 C 19.479 11.848,18.521 11.848,18.129 12.514 L 18.020 12.700 18.009 14.638 L 17.997 16.576 11.769 10.353 C 6.031 4.620,5.524 4.125,5.343 4.065 C 5.107 3.987,4.874 3.986,4.670 4.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveDownRight = /*@__PURE__*/ forwardRef<ComponentInternals, MoveDownRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    