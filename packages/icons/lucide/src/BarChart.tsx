
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type BarChartProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-bar-chart" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.695 3.057 C 17.466 3.129,17.256 3.299,17.128 3.516 L 17.020 3.700 17.020 12.003 L 17.020 20.306 17.141 20.503 C 17.543 21.156,18.457 21.156,18.859 20.503 L 18.980 20.306 18.980 12.003 L 18.980 3.700 18.872 3.516 C 18.628 3.101,18.150 2.915,17.695 3.057 M11.695 9.057 C 11.466 9.129,11.256 9.299,11.128 9.516 L 11.020 9.700 11.020 15.003 L 11.020 20.306 11.141 20.503 C 11.543 21.156,12.457 21.156,12.859 20.503 L 12.980 20.306 12.980 15.003 L 12.980 9.700 12.872 9.516 C 12.628 9.101,12.150 8.915,11.695 9.057 M5.695 15.057 C 5.466 15.129,5.256 15.299,5.128 15.516 L 5.020 15.700 5.020 18.003 L 5.020 20.306 5.141 20.503 C 5.209 20.613,5.346 20.756,5.452 20.828 C 5.923 21.144,6.554 20.999,6.859 20.503 L 6.980 20.306 6.980 18.003 L 6.980 15.700 6.872 15.516 C 6.628 15.101,6.150 14.915,5.695 15.057 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const BarChart = /*@__PURE__*/ forwardRef<ComponentInternals, BarChartProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    