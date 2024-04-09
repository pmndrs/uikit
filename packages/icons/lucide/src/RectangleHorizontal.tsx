
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type RectangleHorizontalProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-rectangle-horizontal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.499 5.043 C 2.380 5.232,1.461 6.048,1.114 7.160 L 1.020 7.460 1.020 12.000 L 1.020 16.540 1.114 16.840 C 1.422 17.827,2.173 18.578,3.160 18.886 L 3.460 18.980 12.000 18.980 L 20.540 18.980 20.840 18.886 C 21.827 18.578,22.578 17.827,22.886 16.840 L 22.980 16.540 22.980 12.000 L 22.980 7.460 22.886 7.160 C 22.581 6.182,21.832 5.428,20.861 5.121 L 20.540 5.020 12.120 5.014 C 7.489 5.011,3.609 5.024,3.499 5.043 M20.310 7.061 C 20.589 7.144,20.856 7.411,20.939 7.690 C 20.992 7.867,21.000 8.441,21.000 12.001 C 21.000 16.458,21.007 16.319,20.779 16.618 C 20.718 16.698,20.585 16.813,20.484 16.872 L 20.300 16.980 12.000 16.980 L 3.700 16.980 3.516 16.872 C 3.303 16.747,3.141 16.550,3.058 16.316 C 2.969 16.062,2.971 7.992,3.061 7.690 C 3.140 7.421,3.412 7.143,3.673 7.063 C 3.833 7.014,5.030 7.005,11.983 7.003 C 19.144 7.000,20.130 7.007,20.310 7.061 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const RectangleHorizontal = /*@__PURE__*/ forwardRef<ComponentInternals, RectangleHorizontalProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    