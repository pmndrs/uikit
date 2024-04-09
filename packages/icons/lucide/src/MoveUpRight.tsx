
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveUpRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-up-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.695 4.057 C 12.466 4.129,12.256 4.299,12.128 4.516 C 12.037 4.672,12.020 4.746,12.020 5.000 C 12.020 5.256,12.036 5.328,12.131 5.489 C 12.256 5.702,12.449 5.864,12.670 5.943 C 12.787 5.985,13.234 5.997,14.700 5.998 L 16.580 6.000 10.374 12.210 C 6.960 15.626,4.135 18.483,4.095 18.560 C 4.043 18.659,4.021 18.788,4.021 19.000 C 4.020 19.258,4.036 19.327,4.133 19.492 C 4.263 19.714,4.502 19.901,4.736 19.965 C 4.938 20.019,5.266 19.989,5.445 19.899 C 5.519 19.862,8.374 17.040,11.789 13.628 L 17.997 7.423 18.009 9.365 L 18.020 11.306 18.141 11.503 C 18.543 12.156,19.457 12.156,19.859 11.503 L 19.980 11.306 19.991 8.063 C 20.001 5.126,19.996 4.804,19.936 4.646 C 19.845 4.405,19.657 4.204,19.420 4.094 L 19.220 4.001 16.040 4.003 C 13.557 4.005,12.824 4.017,12.695 4.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveUpRight = /*@__PURE__*/ forwardRef<ComponentInternals, MoveUpRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    