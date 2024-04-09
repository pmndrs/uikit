
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ArrowUpProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-arrow-up" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.580 4.096 C 11.419 4.173,10.673 4.900,7.774 7.806 C 5.791 9.794,4.138 11.481,4.101 11.555 C 3.872 12.010,4.056 12.601,4.508 12.867 C 4.673 12.964,4.742 12.980,5.000 12.979 C 5.212 12.979,5.341 12.957,5.440 12.905 C 5.517 12.865,6.799 11.615,8.289 10.127 L 10.999 7.422 11.009 13.364 L 11.020 19.306 11.141 19.503 C 11.543 20.156,12.457 20.156,12.859 19.503 L 12.980 19.306 12.991 13.364 L 13.001 7.422 15.711 10.127 C 17.201 11.615,18.483 12.865,18.560 12.905 C 18.659 12.957,18.788 12.979,19.000 12.979 C 19.258 12.980,19.327 12.964,19.492 12.867 C 19.714 12.737,19.901 12.498,19.965 12.264 C 20.019 12.062,19.989 11.734,19.899 11.555 C 19.862 11.481,18.209 9.794,16.226 7.806 C 13.327 4.900,12.581 4.173,12.420 4.096 C 12.151 3.968,11.849 3.968,11.580 4.096 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const ArrowUp = /*@__PURE__*/ forwardRef<ComponentInternals, ArrowUpProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    