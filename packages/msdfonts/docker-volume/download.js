import https from 'https' // or 'https' for https:// URLs
import http from 'http'
import fs from 'fs'

const [, , fontFamily, variant] = process.argv

https
  .get(
    `https://www.googleapis.com/webfonts/v1/webfonts?family=${fontFamily}&key=${process.env.GOOGLE_FONTS_API_KEY}`,
    (res) => {
      let body = ''

      res.on('data', (chunk) => {
        body += chunk
      })

      res.on('end', () => {
        try {
          let json = JSON.parse(body)
          if (json.error != null) {
            console.error('fetch font families', fontFamily, json.error)
            return
          }
          const [, url] = Object.entries(json.items[0].files).find(
            ([name]) => name.toLocaleLowerCase() === variant.toLocaleLowerCase(),
          )
          download(url)
        } catch (error) {
          console.error('fetch font families', fontFamily, error.message)
        }
      })
    },
  )
  .on('error', (error) => {
    console.error('fetch font families', fontFamily, error.message)
  })

function download(url) {
  try {
    const file = fs.createWriteStream(`font.ttf`)
    ;(url.startsWith('https') ? https : http)
      .get(url, (response) => {
        response.pipe(file)

        // after download completed close filestream
        file.on('finish', () => {
          file.close()
        })
      })
      .on('error', (error) => {
        console.error('download', error.message)
      })
  } catch (error) {
    console.error('download', error.message)
  }
}
