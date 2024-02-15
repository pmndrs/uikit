import { readdir } from "fs/promises";
import path from "path";
import child_process from "child_process";

const searchDir = "node_modules/lucide-static/icons/";

async function main() {
  const files = await readdir(searchDir);
  const icons = files.filter((file) => path.extname(file) === ".svg");
  for (const icon of icons) {
    console.log(icon)
    child_process.exec(
      `inkscape -p ${searchDir}${icon} --actions="select-all;object-stroke-to-path" -l -o ./icons/${icon}`
    ).stderr?.on("data", console.error);
  }
}

main();
