import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

// Cross-Origin Isolation service worker.
// Injects COOP/COEP headers into every response so that pages become
// cross-origin isolated, enabling SharedArrayBuffer (required by webR / WASM).
// Based on the coi-serviceworker pattern (https://github.com/gzuidhof/coi-serviceworker).
const SW_SOURCE = `/* eslint-disable */
/* COI service worker: enables cross-origin isolation for SharedArrayBuffer / webR. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 0) return response;
        const headers = new Headers(response.headers);
        headers.set("Cross-Origin-Embedder-Policy", "credentialless");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
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
