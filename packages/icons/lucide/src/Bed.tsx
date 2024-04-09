
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type BedProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-bed" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.695 3.057 C 1.466 3.129,1.256 3.299,1.128 3.516 L 1.020 3.700 1.020 12.003 L 1.020 20.306 1.141 20.503 C 1.543 21.156,2.457 21.156,2.859 20.503 L 2.980 20.307 2.992 19.153 L 3.005 18.000 12.000 18.000 L 20.995 18.000 21.008 19.153 L 21.020 20.307 21.141 20.503 C 21.543 21.156,22.457 21.156,22.859 20.503 L 22.980 20.306 22.980 14.883 L 22.980 9.460 22.886 9.160 C 22.581 8.182,21.832 7.428,20.861 7.121 L 20.540 7.020 11.772 7.009 L 3.003 6.999 2.992 5.349 L 2.980 3.700 2.872 3.516 C 2.628 3.101,2.150 2.915,1.695 3.057 M5.000 12.500 L 5.000 16.000 4.000 16.000 L 3.000 16.000 3.000 12.500 L 3.000 9.000 4.000 9.000 L 5.000 9.000 5.000 12.500 M20.310 9.061 C 20.589 9.144,20.856 9.411,20.939 9.690 C 20.991 9.865,21.000 10.331,21.000 12.947 L 21.000 16.000 14.000 16.000 L 7.000 16.000 7.000 12.500 L 7.000 9.000 13.553 9.000 C 19.303 9.000,20.131 9.007,20.310 9.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Bed = /*@__PURE__*/ forwardRef<ComponentInternals, BedProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    