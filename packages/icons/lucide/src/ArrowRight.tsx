
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.670 4.061 C 11.448 4.142,11.250 4.309,11.128 4.516 C 11.036 4.672,11.020 4.745,11.021 5.000 C 11.021 5.212,11.043 5.341,11.095 5.440 C 11.135 5.517,12.386 6.800,13.874 8.290 L 16.579 11.000 10.736 11.000 C 5.901 11.000,4.861 11.009,4.710 11.055 C 4.467 11.128,4.260 11.293,4.128 11.516 C 4.037 11.672,4.020 11.746,4.020 12.000 C 4.020 12.256,4.036 12.328,4.131 12.489 C 4.256 12.702,4.449 12.864,4.670 12.943 C 4.793 12.987,5.892 12.997,10.700 12.998 L 16.579 13.000 13.874 15.710 C 12.386 17.201,11.135 18.483,11.095 18.560 C 11.043 18.659,11.021 18.788,11.021 19.000 C 11.020 19.258,11.036 19.327,11.133 19.492 C 11.263 19.714,11.502 19.901,11.736 19.965 C 11.938 20.019,12.266 19.989,12.445 19.899 C 12.519 19.862,14.206 18.209,16.194 16.226 C 20.117 12.312,19.999 12.443,19.999 12.000 C 19.999 11.557,20.120 11.690,16.174 7.755 C 12.854 4.443,12.523 4.125,12.343 4.065 C 12.107 3.987,11.874 3.986,11.670 4.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowRight = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    