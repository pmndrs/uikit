
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type FilterProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-filter" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.695 2.057 C 1.172 2.221,0.883 2.788,1.057 3.312 C 1.114 3.483,1.732 4.232,5.061 8.167 L 8.998 12.820 8.999 15.983 C 9.000 19.546,8.988 19.392,9.298 19.697 C 9.542 19.937,13.613 21.961,13.908 21.990 C 14.197 22.018,14.491 21.911,14.700 21.702 C 15.018 21.384,15.000 21.666,15.001 16.983 L 15.002 12.820 18.933 8.174 C 21.095 5.618,22.887 3.476,22.916 3.414 C 23.077 3.060,22.986 2.583,22.702 2.300 C 22.374 1.971,23.388 2.000,12.003 2.003 C 3.826 2.005,1.828 2.015,1.695 2.057 M19.433 4.486 C 15.171 9.516,13.178 11.890,13.107 12.020 L 13.020 12.180 13.009 15.770 C 13.003 17.745,12.990 19.360,12.979 19.360 C 12.969 19.360,12.520 19.140,11.981 18.871 L 11.002 18.382 10.991 15.281 C 10.980 12.182,10.980 12.180,10.893 12.020 C 10.822 11.890,8.875 9.571,4.553 4.470 L 4.155 4.000 12.000 4.000 L 19.845 4.000 19.433 4.486 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Filter = /*@__PURE__*/ forwardRef<ComponentInternals, FilterProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    