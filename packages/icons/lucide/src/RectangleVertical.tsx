
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type RectangleVerticalProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-rectangle-vertical" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.499 1.043 C 6.379 1.234,5.461 2.048,5.114 3.160 L 5.020 3.460 5.020 12.000 L 5.020 20.540 5.114 20.840 C 5.422 21.827,6.173 22.578,7.160 22.886 L 7.460 22.980 12.000 22.980 L 16.540 22.980 16.840 22.886 C 17.827 22.578,18.578 21.827,18.886 20.840 L 18.980 20.540 18.980 12.000 L 18.980 3.460 18.886 3.160 C 18.581 2.182,17.832 1.428,16.861 1.121 L 16.540 1.020 12.120 1.014 C 9.689 1.011,7.609 1.024,7.499 1.043 M16.310 3.061 C 16.589 3.144,16.856 3.411,16.939 3.690 C 16.993 3.870,17.000 4.860,17.000 12.001 C 17.000 18.754,16.991 20.138,16.945 20.290 C 16.872 20.533,16.707 20.740,16.484 20.872 L 16.300 20.980 12.000 20.980 L 7.700 20.980 7.516 20.872 C 7.415 20.813,7.284 20.700,7.225 20.623 C 6.985 20.308,7.000 20.888,7.000 12.022 C 7.000 2.888,6.974 3.632,7.304 3.303 C 7.618 2.989,7.346 3.006,11.983 3.003 C 15.563 3.000,16.132 3.008,16.310 3.061 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const RectangleVertical = /*@__PURE__*/ forwardRef<ComponentInternals, RectangleVerticalProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    