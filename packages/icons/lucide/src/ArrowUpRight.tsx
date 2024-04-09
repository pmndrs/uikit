
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowUpRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.695 6.057 C 6.466 6.129,6.256 6.299,6.128 6.516 C 6.037 6.672,6.020 6.746,6.020 7.000 C 6.020 7.256,6.036 7.328,6.131 7.489 C 6.256 7.702,6.449 7.864,6.670 7.943 C 6.791 7.986,7.563 7.997,10.700 7.998 L 14.579 8.000 10.374 12.210 C 8.061 14.525,6.135 16.483,6.095 16.560 C 6.043 16.659,6.021 16.788,6.021 17.000 C 6.020 17.258,6.036 17.327,6.133 17.492 C 6.263 17.714,6.502 17.901,6.736 17.965 C 6.938 18.019,7.266 17.989,7.445 17.899 C 7.519 17.862,9.474 15.940,11.789 13.627 L 15.998 9.422 16.009 13.364 L 16.020 17.306 16.141 17.503 C 16.543 18.156,17.457 18.156,17.859 17.503 L 17.980 17.306 17.991 12.063 C 18.001 7.272,17.996 6.805,17.936 6.646 C 17.845 6.405,17.657 6.204,17.420 6.094 L 17.220 6.001 12.040 6.003 C 7.921 6.005,6.826 6.016,6.695 6.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowUpRight = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowUpRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    