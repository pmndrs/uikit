
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ReplyProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-reply" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.660 6.066 C 8.474 6.122,8.278 6.308,5.826 8.753 C 2.961 11.609,3.001 11.564,3.001 12.000 C 3.001 12.435,2.964 12.393,5.806 15.226 C 7.244 16.659,8.481 17.862,8.555 17.899 C 9.010 18.128,9.601 17.944,9.867 17.492 C 9.964 17.327,9.980 17.258,9.979 17.000 C 9.979 16.788,9.957 16.659,9.905 16.560 C 9.865 16.483,9.064 15.650,8.126 14.709 L 6.420 12.998 11.480 13.009 L 16.540 13.020 16.861 13.121 C 17.825 13.426,18.584 14.186,18.876 15.139 C 18.969 15.446,18.975 15.522,18.997 16.883 L 19.020 18.307 19.141 18.503 C 19.543 19.156,20.457 19.156,20.859 18.503 L 20.980 18.306 20.980 16.843 C 20.980 15.256,20.962 15.074,20.733 14.400 C 20.196 12.821,18.850 11.573,17.240 11.162 C 16.644 11.009,16.298 11.000,11.292 11.000 L 6.421 11.000 8.126 9.290 C 9.064 8.350,9.865 7.517,9.905 7.440 C 9.957 7.341,9.979 7.212,9.979 7.000 C 9.980 6.745,9.964 6.672,9.872 6.516 C 9.740 6.293,9.533 6.128,9.290 6.055 C 9.062 5.986,8.915 5.989,8.660 6.066 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const Reply = /*@__PURE__*/ forwardRef<ComponentInternals, ReplyProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    