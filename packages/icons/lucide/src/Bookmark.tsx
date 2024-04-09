
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type BookmarkProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-bookmark" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.499 2.043 C 5.390 2.231,4.488 3.024,4.114 4.140 L 4.020 4.420 4.009 12.778 C 3.997 22.166,3.972 21.374,4.298 21.700 C 4.568 21.970,4.964 22.066,5.307 21.944 C 5.394 21.914,6.935 21.049,8.732 20.022 L 12.000 18.154 15.290 20.032 C 17.099 21.065,18.650 21.933,18.736 21.960 C 19.221 22.115,19.826 21.778,19.961 21.277 C 19.988 21.177,19.998 18.322,19.991 12.773 L 19.980 4.420 19.886 4.140 C 19.556 3.158,18.821 2.425,17.861 2.121 L 17.540 2.020 12.120 2.014 C 9.139 2.011,6.609 2.024,6.499 2.043 M17.310 4.061 C 17.592 4.144,17.858 4.412,17.940 4.693 C 17.993 4.876,17.999 5.777,17.990 12.085 L 17.980 19.269 15.260 17.712 C 13.764 16.857,12.477 16.128,12.400 16.093 C 12.318 16.056,12.152 16.029,12.000 16.029 C 11.848 16.029,11.682 16.056,11.600 16.093 C 11.523 16.128,10.236 16.857,8.740 17.712 L 6.020 19.269 6.010 12.085 C 5.999 4.001,5.975 4.632,6.303 4.303 C 6.621 3.985,6.233 4.006,11.983 4.003 C 16.458 4.000,17.131 4.008,17.310 4.061 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Bookmark = /*@__PURE__*/ forwardRef<ComponentInternals, BookmarkProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    