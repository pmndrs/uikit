
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type OctagonProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-octagon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.540 1.061 C 7.452 1.093,7.371 1.119,7.361 1.119 C 7.350 1.120,5.958 2.501,4.266 4.190 C 1.807 6.646,1.173 7.300,1.096 7.460 L 1.001 7.660 1.001 12.000 C 1.002 16.266,1.003 16.343,1.082 16.520 C 1.145 16.659,1.858 17.396,4.212 19.753 C 5.954 21.497,7.329 22.843,7.420 22.893 L 7.580 22.980 12.000 22.980 C 16.220 22.980,16.426 22.977,16.560 22.906 C 16.753 22.804,22.783 16.781,22.893 16.580 L 22.980 16.420 22.980 12.000 C 22.980 7.780,22.977 7.574,22.906 7.440 C 22.804 7.247,16.781 1.217,16.580 1.107 L 16.420 1.020 12.060 1.011 C 8.336 1.004,7.677 1.011,7.540 1.061 M18.370 5.630 L 21.000 8.260 21.000 12.000 L 21.000 15.740 18.370 18.370 L 15.740 21.000 12.000 21.000 L 8.260 21.000 5.630 18.370 L 3.000 15.740 3.000 12.000 L 3.000 8.260 5.630 5.630 L 8.260 3.000 12.000 3.000 L 15.740 3.000 18.370 5.630 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Octagon = /*@__PURE__*/ forwardRef<ComponentInternals, OctagonProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    