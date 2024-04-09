
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type Tally1Props = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-tally-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.695 3.057 C 3.466 3.129,3.256 3.299,3.128 3.516 L 3.020 3.700 3.020 12.003 L 3.020 20.306 3.141 20.503 C 3.543 21.156,4.457 21.156,4.859 20.503 L 4.980 20.306 4.980 12.003 L 4.980 3.700 4.872 3.516 C 4.628 3.101,4.150 2.915,3.695 3.057 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Tally1 = /*@__PURE__*/ forwardRef<ComponentInternals, Tally1Props>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    