
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type DotProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-dot" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.540 10.174 C 11.089 10.323,10.642 10.663,10.400 11.041 C 10.012 11.645,10.010 12.553,10.397 13.155 C 10.779 13.751,11.399 14.092,12.100 14.092 C 12.652 14.092,13.069 13.926,13.469 13.548 C 13.899 13.141,14.088 12.700,14.088 12.100 C 14.088 11.290,13.671 10.643,12.920 10.284 C 12.636 10.148,12.596 10.140,12.160 10.131 C 11.862 10.125,11.644 10.140,11.540 10.174 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Dot = /*@__PURE__*/ forwardRef<ComponentInternals, DotProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    