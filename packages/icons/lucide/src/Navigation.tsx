
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type NavigationProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-navigation" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.660 1.074 C 21.500 1.132,4.108 9.358,2.729 10.028 C 2.313 10.231,2.158 10.384,2.055 10.694 C 1.966 10.964,2.001 11.276,2.149 11.514 C 2.378 11.885,2.214 11.832,6.381 12.875 L 10.176 13.824 11.122 17.609 C 11.773 20.209,12.098 21.439,12.160 21.540 C 12.499 22.089,13.362 22.143,13.763 21.640 C 13.865 21.511,22.848 2.594,22.954 2.284 C 23.114 1.814,22.819 1.230,22.340 1.066 C 22.093 0.982,21.911 0.984,21.660 1.074 M19.825 4.250 C 19.794 4.321,18.351 7.368,16.619 11.020 C 14.887 14.672,13.435 17.738,13.392 17.833 C 13.349 17.929,13.304 17.997,13.293 17.986 C 13.281 17.975,12.970 16.757,12.600 15.280 C 12.077 13.192,11.904 12.560,11.823 12.438 C 11.617 12.126,11.610 12.124,8.720 11.400 C 7.243 11.030,6.025 10.718,6.013 10.706 C 6.001 10.694,6.052 10.659,6.126 10.627 C 6.200 10.595,9.320 9.118,13.060 7.345 C 16.800 5.572,19.865 4.121,19.871 4.120 C 19.876 4.120,19.856 4.179,19.825 4.250 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Navigation = /*@__PURE__*/ forwardRef<ComponentInternals, NavigationProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    