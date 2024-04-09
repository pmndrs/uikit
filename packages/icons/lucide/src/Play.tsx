
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type PlayProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-play" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.695 2.057 C 4.466 2.129,4.256 2.299,4.128 2.516 L 4.020 2.700 4.010 11.919 C 3.998 22.269,3.972 21.374,4.298 21.700 C 4.565 21.967,4.982 22.067,5.320 21.946 C 5.397 21.919,8.661 19.838,12.574 17.323 C 20.150 12.452,19.860 12.650,19.964 12.264 C 20.059 11.911,19.918 11.459,19.647 11.247 C 19.341 11.009,5.453 2.107,5.305 2.055 C 5.116 1.988,4.914 1.989,4.695 2.057 M11.674 8.480 C 14.669 10.405,17.119 11.989,17.119 12.000 C 17.120 12.016,6.265 19.014,6.056 19.132 C 6.008 19.159,6.000 18.150,6.000 11.998 L 6.000 4.832 6.115 4.906 C 6.178 4.947,8.680 6.555,11.674 8.480 " stroke="none" fill="black" fill-rule="evenodd"></path></svg>`;
      export const Play = /*@__PURE__*/ forwardRef<ComponentInternals, PlayProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    