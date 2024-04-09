
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type CheckProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-check" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.640 5.068 C 19.483 5.121,18.793 5.795,14.230 10.354 L 9.001 15.578 6.770 13.353 C 4.622 11.209,4.532 11.125,4.323 11.064 C 4.057 10.986,3.945 10.984,3.710 11.055 C 3.467 11.128,3.260 11.293,3.128 11.516 C 3.037 11.672,3.020 11.746,3.020 12.000 C 3.020 12.254,3.036 12.328,3.127 12.480 C 3.262 12.706,8.368 17.805,8.560 17.905 C 8.659 17.957,8.788 17.979,9.000 17.979 C 9.255 17.980,9.327 17.964,9.480 17.873 C 9.708 17.737,20.805 6.633,20.905 6.440 C 20.957 6.341,20.979 6.212,20.979 6.000 C 20.980 5.745,20.964 5.672,20.872 5.516 C 20.617 5.083,20.122 4.903,19.640 5.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Check = /*@__PURE__*/ forwardRef<ComponentInternals, CheckProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    