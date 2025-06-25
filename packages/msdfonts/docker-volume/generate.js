import https from 'https'
import http from 'http'
import fs, { writeFileSync } from 'fs'
import { exec } from 'child_process'
import { dirname, resolve } from 'path'

async function generate(fontFamily, variant) {
  await wait(5000)
  console.log('generating', fontFamily, variant)
  let retries = 0
  let json
  while (retries < 3) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?family=${fontFamily}&key=${process.env.GOOGLE_FONTS_API_KEY}`,
      )
      json = await response.json()
      break
    } catch (error) {
      retries++
      if (retries === 3) {
        console.error('fetch font families', fontFamily, error.message)
        return
      }
      console.log(`Retry ${retries}/3 for ${fontFamily}`)
      await wait(1000 * retries)
    }
  }
  if (json.error != null) {
    console.error('fetch font families', fontFamily, json.error)
    return
  }
  const result = Object.entries(json.items[0].files).find(
    ([name]) => name.toLocaleLowerCase() === variant.toLocaleLowerCase(),
  )
  if (result == null) {
    return false
  }
  await download(result[1], 'font.ttf')
  await runCmd("fontforge -lang=ff -c 'Open($1); SelectAll(); RemoveOverlap(); Generate($2)' font.ttf fixed-font.ttf")
  await runCmd(`npm run msdf`)
  await runCmd(`npm run webp`)
  return true
}

const variants = { light: '300', regular: '400', medium: '500', 'semi-bold': '600', bold: '700' }
const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
  'Nunito',
  'Raleway',
  'Work Sans',
  'Playfair Display',
  'Merriweather',
  'Libre Baskerville',
  'Crimson Text',
  'Fira Code',
  'Source Code Pro',
  'Inconsolata',
  'Space Mono',
]

async function main() {
  let result = ''
  for (const fontFamily of fontFamilies) {
    result += `export const ${fontFamily.toLowerCase().replaceAll(/ (.)/g, (_, g) => g.toUpperCase())} = {`
    for (const [fontWeightName, fontWeightValue] of Object.entries(variants)) {
      if (!(await generate(fontFamily, fontWeightValue))) {
        continue
      }
      result += `\t"${fontWeightName}": ${fontToJson('fixed-font.json')},`
    }
    result += `}\n\n`
  }
  writeFileSync('./index.ts', result)
}

main().catch(console.error)

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function runCmd(cmd) {
  return new Promise((resolve, reject) =>
    exec(cmd, (error) => {
      if (error == null) {
        resolve()
        return
      }
      reject(error)
    }),
  )
}

function download(url, to) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(to)
    ;(url.startsWith('https') ? https : http)
      .get(url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', reject)
  })
}

function fontToJson(jsonPath) {
  const json = JSON.parse(fs.readFileSync(jsonPath))

  for (let i = 0; i < json.pages.length; i++) {
    const url = resolve(dirname(jsonPath), json.pages[i]).replace('.png', '.webp')
    json.pages[i] = toUrl(fs.readFileSync(url), 'image/webp')
  }

  return JSON.stringify(json)
}

function toUrl(buf, mimeType) {
  return `data:${mimeType};base64,${buf.toString('base64')}`
}
