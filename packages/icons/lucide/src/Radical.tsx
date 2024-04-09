
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type RadicalProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-radical" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.643 3.069 C 13.365 3.167,13.140 3.422,13.044 3.747 C 12.999 3.897,12.268 6.981,11.419 10.600 C 10.570 14.219,9.865 17.207,9.853 17.240 C 9.841 17.273,9.397 16.001,8.866 14.414 C 7.811 11.262,7.834 11.314,7.457 11.120 L 7.262 11.020 5.121 11.007 C 3.665 10.999,2.915 11.009,2.776 11.039 C 2.516 11.095,2.269 11.276,2.129 11.514 C 2.036 11.672,2.020 11.745,2.020 12.000 C 2.020 12.256,2.036 12.328,2.131 12.489 C 2.192 12.592,2.304 12.725,2.381 12.783 C 2.656 12.993,2.689 12.996,4.546 12.998 L 6.273 13.000 7.681 17.223 C 9.213 21.818,9.160 21.682,9.531 21.874 C 10.084 22.158,10.762 21.887,10.942 21.308 C 10.977 21.194,11.857 17.482,12.897 13.060 L 14.788 5.020 18.044 5.000 L 21.300 4.980 21.492 4.867 C 22.248 4.423,22.123 3.306,21.290 3.055 C 21.141 3.010,20.442 3.001,17.464 3.003 C 14.271 3.006,13.798 3.014,13.643 3.069 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Radical = /*@__PURE__*/ forwardRef<ComponentInternals, RadicalProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    