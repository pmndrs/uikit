
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type Navigation2Props = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-navigation-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.726 1.046 C 11.516 1.106,11.290 1.266,11.183 1.430 C 11.043 1.645,4.032 20.698,4.009 20.926 C 3.941 21.610,4.658 22.173,5.307 21.944 C 5.394 21.914,6.935 21.049,8.732 20.022 L 12.000 18.154 15.290 20.033 C 17.099 21.067,18.652 21.932,18.740 21.956 C 18.962 22.016,19.114 22.011,19.340 21.934 C 19.741 21.797,20.033 21.345,19.991 20.926 C 19.964 20.664,12.949 1.628,12.802 1.420 C 12.578 1.101,12.105 0.937,11.726 1.046 M14.534 11.771 C 15.914 15.518,17.053 18.623,17.066 18.671 C 17.085 18.742,16.616 18.490,14.795 17.449 C 13.533 16.728,12.437 16.111,12.360 16.080 C 12.180 16.005,11.820 16.005,11.640 16.080 C 11.563 16.111,10.467 16.728,9.205 17.449 C 7.384 18.490,6.915 18.742,6.934 18.671 C 6.988 18.465,11.978 4.960,12.000 4.960 C 12.013 4.960,13.154 8.025,14.534 11.771 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Navigation2 = /*@__PURE__*/ forwardRef<ComponentInternals, Navigation2Props>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    