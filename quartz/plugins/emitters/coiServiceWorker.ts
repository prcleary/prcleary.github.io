import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

// Cross-Origin Isolation service worker.
// Injects COOP/COEP headers into every response so that pages become
// cross-origin isolated, enabling SharedArrayBuffer (required by
// in-browser WebAssembly runtimes such as webR and, for its threaded
// features, Pyodide).
// Based on the coi-serviceworker pattern (https://github.com/gzuidhof/coi-serviceworker).
//
// Uses the stricter `require-corp` COEP because Firefox does not yet support
// `credentialless`. `require-corp` in turn demands that every cross-origin
// resource carries a Cross-Origin-Resource-Policy header, so we add
// `Cross-Origin-Resource-Policy: cross-origin` to every response the worker
// forwards. This lets the language runtimes (webr.r-wasm.org, cdn.jsdelivr.net/pyodide)
// and their pre-built package binaries (repo.r-wasm.org, PyPI) load in both
// Chromium and Firefox, desktop and mobile.
const SW_SOURCE = `/* eslint-disable */
/* COI service worker: enables cross-origin isolation for SharedArrayBuffer / WebAssembly runtimes. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
  const url = new URL(event.request.url);
  // For our own runner JS (code-runner.js and the backends/), bypass the
  // HTTP cache entirely so a deploy takes effect on the next page load.
  // Everything else follows normal caching \u2014 in particular the language
  // runtimes and package binaries from webr.r-wasm.org / jsdelivr.net,
  // which are big and change rarely, must stay cacheable.
  const isRunnerAsset =
    url.origin === self.location.origin &&
    /\\/static\\/js\\/(code-runner\\.js|backends\\/)/.test(url.pathname);
  const fetchOpts = isRunnerAsset ? { cache: "no-store" } : undefined;
  event.respondWith(
    fetch(event.request, fetchOpts)
      .then((response) => {
        if (response.status === 0) return response;
        const headers = new Headers(response.headers);
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        // Needed under require-corp so cross-origin fetches (language
        // runtimes and their package binaries) are not blocked by the browser.
        headers.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (isRunnerAsset) {
          // Tell the browser cache to revalidate every time as well, in
          // case a future user hits us without the SW yet installed.
          headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch((e) => console.error(e))
  );
});
`

export const COIServiceWorker: QuartzEmitterPlugin = () => ({
  name: "COIServiceWorker",
  async emit(ctx) {
    const path = await write({
      ctx,
      content: SW_SOURCE,
      slug: "sw" as FullSlug,
      ext: ".js",
    })
    return [path]
  },
  async *partialEmit() {},
})
