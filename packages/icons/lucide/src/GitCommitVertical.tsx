
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type GitCommitVerticalProps = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = `<svg class="lucide lucide-git-commit-vertical" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.695 2.057 C 11.466 2.129,11.256 2.299,11.128 2.516 L 11.020 2.700 11.000 5.413 L 10.980 8.126 10.720 8.217 C 9.350 8.697,8.370 9.816,8.083 11.227 C 7.700 13.105,8.756 15.031,10.540 15.711 C 10.716 15.778,10.891 15.843,10.929 15.855 C 10.993 15.875,10.999 16.063,11.009 18.592 L 11.020 21.306 11.141 21.503 C 11.543 22.156,12.457 22.156,12.859 21.503 L 12.980 21.306 12.991 18.592 C 13.001 16.063,13.007 15.875,13.071 15.855 C 14.340 15.452,15.237 14.645,15.704 13.488 C 16.560 11.365,15.464 8.983,13.280 8.217 L 13.020 8.126 13.000 5.413 L 12.980 2.700 12.872 2.516 C 12.628 2.101,12.150 1.915,11.695 2.057 M12.523 10.073 C 13.262 10.266,13.850 10.924,13.967 11.690 C 14.067 12.343,13.873 12.933,13.403 13.404 C 13.002 13.807,12.547 14.000,12.000 14.000 C 11.485 14.000,11.038 13.822,10.653 13.465 C 9.323 12.229,10.189 10.005,12.000 10.005 C 12.143 10.005,12.378 10.036,12.523 10.073 " stroke="none" fill-rule="evenodd" fill="black"></path></svg>`;
      export const GitCommitVertical = /*@__PURE__*/ forwardRef<ComponentInternals, GitCommitVerticalProps>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    