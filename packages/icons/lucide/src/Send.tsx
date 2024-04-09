
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type SendProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.655 4.556 C 3.352 7.466,1.502 8.128,1.369 8.233 C 0.922 8.587,0.887 9.291,1.295 9.696 C 1.441 9.841,1.957 10.081,5.820 11.795 C 8.218 12.859,10.200 13.750,10.225 13.775 C 10.250 13.800,11.137 15.772,12.197 18.158 C 13.256 20.544,14.168 22.555,14.223 22.627 C 14.278 22.699,14.408 22.808,14.511 22.869 C 14.898 23.096,15.484 22.986,15.771 22.632 C 15.949 22.412,22.999 2.270,22.999 1.980 C 23.000 1.445,22.541 0.997,22.000 1.005 C 21.815 1.007,20.153 1.578,11.655 4.556 M14.477 8.103 L 10.774 11.806 7.768 10.473 C 6.115 9.740,4.762 9.130,4.761 9.117 C 4.760 9.099,18.077 4.413,18.160 4.403 C 18.171 4.401,16.514 6.066,14.477 8.103 M19.425 6.330 C 19.330 6.600,18.274 9.615,17.079 13.031 C 15.884 16.447,14.892 19.228,14.875 19.211 C 14.858 19.194,14.249 17.840,13.521 16.202 L 12.197 13.223 15.888 9.532 C 17.919 7.501,19.584 5.840,19.589 5.840 C 19.594 5.840,19.520 6.060,19.425 6.330 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Send = /*@__PURE__*/ forwardRef<ComponentInternals, SendProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    