
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveUpLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-up-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.580 4.094 C 4.343 4.204,4.155 4.405,4.064 4.646 C 4.004 4.804,3.999 5.126,4.009 8.063 L 4.020 11.306 4.141 11.503 C 4.543 12.156,5.457 12.156,5.859 11.503 L 5.980 11.306 5.991 9.365 L 6.003 7.423 12.211 13.628 C 15.626 17.040,18.481 19.862,18.555 19.899 C 19.010 20.127,19.601 19.944,19.867 19.492 C 19.964 19.327,19.980 19.258,19.979 19.000 C 19.979 18.788,19.957 18.659,19.905 18.560 C 19.865 18.483,17.040 15.626,13.626 12.210 L 7.420 6.000 9.300 5.998 C 10.766 5.997,11.213 5.985,11.330 5.943 C 11.551 5.864,11.744 5.702,11.869 5.489 C 11.964 5.328,11.980 5.256,11.980 5.000 C 11.980 4.746,11.963 4.672,11.872 4.516 C 11.813 4.415,11.698 4.282,11.618 4.221 C 11.324 3.997,11.377 4.000,7.944 4.000 L 4.780 4.001 4.580 4.094 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveUpLeft = /*@__PURE__*/ forwardRef<ComponentInternals, MoveUpLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    