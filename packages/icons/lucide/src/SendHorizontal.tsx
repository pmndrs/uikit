
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SendHorizontalProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-send-horizontal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.643 2.069 C 2.284 2.196,2.000 2.614,2.000 3.016 C 2.000 3.122,2.507 4.700,3.470 7.589 L 4.939 12.000 3.470 16.411 C 2.507 19.300,2.000 20.878,2.000 20.984 C 2.000 21.649,2.677 22.161,3.284 21.954 C 3.634 21.834,22.593 12.823,22.695 12.727 C 23.091 12.358,23.091 11.638,22.695 11.274 C 22.585 11.173,3.760 2.225,3.340 2.074 C 3.097 1.987,2.879 1.986,2.643 2.069 M10.920 7.862 C 14.253 9.440,17.106 10.792,17.260 10.865 L 17.540 10.997 12.133 10.999 L 6.727 11.000 5.723 7.990 C 5.171 6.334,4.720 4.966,4.720 4.949 C 4.720 4.931,4.752 4.934,4.790 4.954 C 4.829 4.974,7.587 6.283,10.920 7.862 M17.380 13.084 C 16.645 13.447,4.737 19.069,4.726 19.059 C 4.718 19.051,5.165 17.685,5.719 16.023 L 6.727 13.000 12.133 13.002 L 17.540 13.005 17.380 13.084 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const SendHorizontal = /*@__PURE__*/ forwardRef<ComponentInternals, SendHorizontalProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    