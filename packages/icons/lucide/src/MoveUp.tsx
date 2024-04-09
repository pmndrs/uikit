
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type MoveUpProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-move-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.580 1.096 C 11.422 1.172,10.940 1.634,9.274 3.306 C 8.116 4.469,7.138 5.481,7.101 5.555 C 6.872 6.010,7.056 6.601,7.508 6.867 C 7.673 6.964,7.742 6.980,8.000 6.979 C 8.213 6.979,8.341 6.957,8.440 6.905 C 8.517 6.864,9.124 6.289,9.790 5.627 L 10.999 4.422 11.010 13.364 L 11.020 22.306 11.141 22.503 C 11.209 22.613,11.346 22.756,11.452 22.828 C 11.923 23.144,12.554 22.999,12.859 22.503 L 12.980 22.306 12.990 13.364 L 13.001 4.422 14.210 5.627 C 14.876 6.289,15.483 6.864,15.560 6.905 C 15.659 6.957,15.787 6.979,16.000 6.979 C 16.258 6.980,16.327 6.964,16.492 6.867 C 16.714 6.737,16.901 6.498,16.965 6.264 C 17.019 6.061,16.989 5.733,16.899 5.555 C 16.862 5.481,15.884 4.469,14.726 3.306 C 13.060 1.634,12.578 1.172,12.420 1.096 C 12.151 0.968,11.849 0.968,11.580 1.096 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const MoveUp = /*@__PURE__*/ forwardRef<ComponentInternals, MoveUpProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    