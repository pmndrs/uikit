
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type TriangleRightProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-triangle-right" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.857 2.977 C 20.591 3.037,20.151 3.246,19.900 3.430 C 19.275 3.889,1.804 18.062,1.596 18.279 C 1.195 18.698,1.012 19.145,1.049 19.615 C 1.104 20.289,1.599 20.776,2.400 20.943 C 2.642 20.993,3.901 21.000,11.630 20.991 L 20.580 20.980 20.860 20.886 C 21.851 20.554,22.582 19.816,22.886 18.840 L 22.980 18.540 22.980 11.520 L 22.980 4.500 22.887 4.203 C 22.718 3.665,22.410 3.293,21.959 3.082 C 21.638 2.933,21.224 2.893,20.857 2.977 M20.960 18.224 C 20.905 18.484,20.724 18.731,20.486 18.871 L 20.300 18.980 12.063 18.990 C 7.533 18.996,3.834 18.993,3.843 18.984 C 3.852 18.975,7.712 15.851,12.420 12.042 L 20.980 5.118 20.992 11.569 C 21.001 16.122,20.991 18.080,20.960 18.224 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const TriangleRight = /*@__PURE__*/ forwardRef<ComponentInternals, TriangleRightProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    