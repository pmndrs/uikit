
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ChevronUpProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-chevron-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.640 8.068 C 11.485 8.121,11.036 8.553,8.347 11.235 C 6.570 13.008,5.188 14.417,5.127 14.520 C 5.036 14.672,5.020 14.746,5.020 15.000 C 5.020 15.257,5.036 15.327,5.133 15.492 C 5.263 15.714,5.502 15.901,5.736 15.965 C 5.938 16.019,6.266 15.989,6.445 15.899 C 6.519 15.862,7.800 14.614,9.290 13.126 L 12.000 10.421 14.710 13.126 C 16.200 14.614,17.481 15.862,17.555 15.899 C 18.010 16.128,18.601 15.944,18.867 15.492 C 18.964 15.327,18.980 15.257,18.980 15.000 C 18.980 14.746,18.964 14.672,18.873 14.520 C 18.812 14.417,17.431 13.008,15.653 11.235 C 12.817 8.407,12.522 8.125,12.343 8.065 C 12.102 7.986,11.878 7.986,11.640 8.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ChevronUp = /*@__PURE__*/ forwardRef<ComponentInternals, ChevronUpProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    