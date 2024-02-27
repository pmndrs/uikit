//@ts-ignore
import SVGFixer from 'oslllo-svg-fixer'

const searchDir = 'node_modules/lucide-static/icons/'
const outDir = './icons/'

async function main() {
  await SVGFixer(searchDir, outDir).fix()
}

main()
