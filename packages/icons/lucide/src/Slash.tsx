
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SlashProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-slash" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.640 1.068 C 21.482 1.121,20.229 2.359,11.347 11.234 C 5.785 16.793,1.190 21.416,1.135 21.508 C 0.861 21.967,1.032 22.587,1.508 22.867 C 1.673 22.964,1.743 22.980,2.000 22.980 C 2.254 22.980,2.327 22.964,2.480 22.873 C 2.709 22.736,22.805 2.633,22.905 2.440 C 22.957 2.341,22.979 2.212,22.979 2.000 C 22.980 1.745,22.964 1.672,22.872 1.516 C 22.618 1.083,22.123 0.903,21.640 1.068 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Slash = /*@__PURE__*/ forwardRef<ComponentInternals, SlashProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    