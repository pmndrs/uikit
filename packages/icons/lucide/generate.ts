import { readdir, readFile, writeFile } from "fs/promises";

const baseDir = "icons/";

async function main() {
  const icons = await readdir(baseDir);
  for (const icon of icons) {
    if (icon === ".gitkeep") {
      continue;
    }
    const name = getName(icon);
    const raw = await readFile(`${baseDir}${icon}`);
    const svg = raw.toString();
    const code = `
      /* eslint-disable no-shadow-restricted-names */
      import { SvgIconFromText, ComponentInternals } from "@react-three/uikit";
      import { ComponentPropsWithoutRef, forwardRef } from "react"; 
      export type ${name}Props = Omit<ComponentPropsWithoutRef<typeof SvgIconFromText>, "text" | "svgWidth" | "svgHeight">;
      const text = \`${svg}\`;
      export const ${name} = forwardRef<ComponentInternals, ${name}Props>((props, ref) => {
        return <SvgIconFromText {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    `;
    writeFile(`src/${name}.tsx`, code);
  }
  writeFile(
    "src/index.tsx",
    icons.filter(icon => icon != ".gitkeep").map((icon) => `export * from "./${getName(icon)}.js";`).join("\n"),
  );
}

function getName(file: string): string {
  const name = file.slice(0, -4);
  return name[0].toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1].toUpperCase());
}

main();
