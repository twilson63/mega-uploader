import App from './app.svelte'

if (!Bundlr.default) {
  throw new Error('WebBundlr not Found!')
} else {
  window.WebBundlr = Bundlr.default
}

new App({
  target: document.body
})