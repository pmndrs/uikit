
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type PenProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-pen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.400 1.077 C 18.213 1.117,17.916 1.207,17.740 1.277 C 16.994 1.575,17.413 1.179,9.767 8.816 C 5.460 13.117,2.683 15.921,2.633 16.016 C 2.527 16.221,1.000 21.816,1.000 22.002 C 1.000 22.526,1.474 23.000,1.998 23.000 C 2.184 23.000,7.779 21.473,7.984 21.367 C 8.079 21.317,10.889 18.534,15.187 14.233 C 20.879 8.535,22.269 7.124,22.419 6.889 C 23.084 5.849,23.206 4.545,22.748 3.380 C 22.486 2.715,21.913 2.029,21.268 1.608 C 20.463 1.082,19.351 0.877,18.400 1.077 M19.659 3.061 C 20.236 3.212,20.701 3.635,20.909 4.200 C 21.025 4.513,21.051 4.778,21.000 5.100 C 20.902 5.713,21.405 5.176,13.861 12.719 C 10.091 16.489,6.982 19.586,6.953 19.602 C 6.868 19.648,3.473 20.566,3.455 20.548 C 3.446 20.539,3.654 19.742,3.917 18.778 L 4.396 17.024 11.245 10.175 C 18.472 2.948,18.211 3.196,18.708 3.060 C 18.972 2.987,19.377 2.988,19.659 3.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Pen = /*@__PURE__*/ forwardRef<ComponentInternals, PenProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    