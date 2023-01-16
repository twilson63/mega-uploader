import fs from 'fs'
import esbuild from 'esbuild'
import esbuildSvelte from 'esbuild-svelte'


if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist/')
}

esbuild.build({
  entryPoints: ['./src/main.js'],
  bundle: true,
  outdir: './dist',
  mainFields: ['svelte', 'browser', 'module', 'main'],
  splitting: true,
  write: true,
  format: 'esm',
  plugins: [esbuildSvelte()]
})
  .catch((error, location) => {
    console.warn('Errors: ', error, location)
    process.exit(1)
  })

fs.copyFileSync('./index.html', './dist/index.html')
fs.copyFileSync('./vendors/web-bundlr.js', './dist/web-bundlr.js')