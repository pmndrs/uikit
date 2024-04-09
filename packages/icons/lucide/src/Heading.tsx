
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type HeadingProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-heading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.695 3.057 C 5.466 3.129,5.256 3.299,5.128 3.516 L 5.020 3.700 5.020 12.003 L 5.020 20.306 5.141 20.503 C 5.543 21.156,6.457 21.156,6.859 20.503 L 6.980 20.306 6.991 16.653 L 7.002 13.000 12.000 13.000 L 16.998 13.000 17.009 16.653 L 17.020 20.306 17.141 20.503 C 17.543 21.156,18.457 21.156,18.859 20.503 L 18.980 20.306 18.980 12.003 L 18.980 3.700 18.871 3.514 C 18.479 2.848,17.521 2.848,17.129 3.514 L 17.020 3.700 17.009 7.350 L 16.998 11.000 12.000 11.000 L 7.002 11.000 6.991 7.350 L 6.980 3.700 6.872 3.516 C 6.628 3.101,6.150 2.915,5.695 3.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Heading = /*@__PURE__*/ forwardRef<ComponentInternals, HeadingProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    