
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type VolumeProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-volume" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.647 4.072 C 10.540 4.114,9.553 4.877,8.061 6.070 L 5.650 8.000 3.771 8.000 C 1.732 8.000,1.664 8.006,1.382 8.221 C 1.302 8.282,1.187 8.415,1.128 8.516 L 1.020 8.700 1.009 11.912 C 1.002 14.005,1.012 15.177,1.039 15.276 C 1.099 15.498,1.290 15.739,1.508 15.867 L 1.700 15.980 3.677 15.991 L 5.654 16.003 8.032 17.906 C 9.341 18.953,10.476 19.848,10.555 19.895 C 10.668 19.961,10.765 19.980,11.000 19.980 C 11.257 19.980,11.327 19.964,11.492 19.867 C 11.709 19.739,11.901 19.498,11.961 19.278 C 11.987 19.179,11.997 16.668,11.990 11.914 L 11.980 4.700 11.872 4.516 C 11.619 4.086,11.096 3.896,10.647 4.072 M10.000 12.000 L 10.000 16.921 8.251 15.521 C 7.023 14.538,6.449 14.103,6.324 14.061 C 6.177 14.010,5.874 14.000,4.573 14.000 L 3.000 14.000 3.000 12.002 L 3.000 10.003 4.650 9.992 C 5.945 9.983,6.323 9.968,6.406 9.926 C 6.464 9.896,7.292 9.244,8.246 8.478 C 9.200 7.713,9.985 7.085,9.990 7.083 C 9.995 7.081,10.000 9.294,10.000 12.000 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Volume = /*@__PURE__*/ forwardRef<ComponentInternals, VolumeProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    