
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type FlagTriangleLeftProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-flag-triangle-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.700 1.056 C 16.612 1.085,14.263 2.247,11.480 3.638 C 7.387 5.686,6.392 6.198,6.275 6.321 C 5.908 6.705,5.918 7.324,6.298 7.697 C 6.433 7.829,7.368 8.311,11.231 10.240 L 15.999 12.619 16.009 17.463 L 16.020 22.306 16.141 22.503 C 16.543 23.156,17.457 23.156,17.859 22.503 L 17.980 22.306 17.980 12.003 L 17.980 1.700 17.872 1.516 C 17.629 1.102,17.147 0.914,16.700 1.056 M16.000 7.000 C 16.000 8.848,15.991 10.360,15.980 10.360 C 15.941 10.360,9.280 7.020,9.280 7.000 C 9.280 6.978,15.919 3.646,15.970 3.642 C 15.987 3.641,16.000 5.152,16.000 7.000 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const FlagTriangleLeft = /*@__PURE__*/ forwardRef<ComponentInternals, FlagTriangleLeftProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    