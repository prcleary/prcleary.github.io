import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

// Cross-Origin Isolation service worker.
//
// Selectively applies COOP/COEP headers so that a small allowlist of pages
// becomes cross-origin isolated, enabling SharedArrayBuffer (required by
// in-browser WebAssembly runtimes such as webR and, for its threaded
// features, Pyodide). All other pages are served untouched, so cross-origin
// iframes (e.g. karakeep, YouTube) and cross-origin subresources
// (e.g. Google Fonts CSS + font files) load normally.
//
// The allowlist below MUST include every page that opts in to
// code-runner.js. If you add another runnable-code page, add its path here.
//
// Based on the coi-serviceworker pattern (https://github.com/gzuidhof/coi-serviceworker).
// Uses the stricter `require-corp` COEP (rather than `credentialless`) because
// Firefox does not yet support `credentialless`. `require-corp` in turn
// demands that every cross-origin resource loaded by an isolated page carries
// a Cross-Origin-Resource-Policy header, so we add
// `Cross-Origin-Resource-Policy: cross-origin` to every same-origin response.
// This lets the code-runner pages load /static/js/... and their pieces load
// each other without CORP errors, while leaving the response body identical.
//
// Cross-origin subresources loaded by isolated pages (webR, Pyodide, their
// package binaries at webr.r-wasm.org / jsdelivr.net / repo.r-wasm.org) are
// already served with correct CORP by their CDNs.
const SW_SOURCE = `/* eslint-disable */
/* COI service worker: selectively enables cross-origin isolation for pages
 * whose path matches COI_PATHS. Other pages pass through untouched.
 */

// Add any new runnable-code page path here (URL path, no trailing slash).
const COI_PATHS = [
  "/Notes/Code/R/runnable-r-and-python-code-blocks-in-a-quartz-blog",
  "/Notes/Code/Python/runnable-python-code-blocks-demo",
];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// True if the given URL path (from same origin) is one of the COI pages.
// Matches with optional trailing slash and optional ".html" suffix so
// GitHub Pages' various URL forms all resolve correctly.
function isCoiPath(pathname) {
  return COI_PATHS.some((p) =>
    pathname === p || pathname === p + "/" || pathname === p + ".html"
  );
}

// True if the given client (Window) is currently on a COI page. Used to
// decide whether same-origin subresources it loads need CORP added.
async function clientIsCoi(clientId) {
  if (!clientId) return false;
  try {
    const client = await self.clients.get(clientId);
    if (!client || !client.url) return false;
    const clientUrl = new URL(client.url);
    return clientUrl.origin === self.location.origin && isCoiPath(clientUrl.pathname);
  } catch (_e) {
    return false;
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;

  // For our own runner JS (code-runner.js and the backends/), bypass the
  // HTTP cache entirely so a deploy takes effect on the next page load.
  const isRunnerAsset =
    sameOrigin && /\\/static\\/js\\/(code-runner\\.js|backends\\/)/.test(url.pathname);
  const fetchOpts = isRunnerAsset ? { cache: "no-store" } : undefined;

  event.respondWith((async () => {
    let response;
    try {
      response = await fetch(event.request, fetchOpts);
    } catch (e) {
      console.error(e);
      return Response.error();
    }
    if (response.status === 0) return response;

    // Decide whether COOP/COEP should be applied.
    // - Top-level navigation (mode === "navigate") to a COI path: yes.
    // - Any other response: no COOP/COEP.
    const isNavigation = event.request.mode === "navigate";
    const applyCoi = isNavigation && sameOrigin && isCoiPath(url.pathname);

    // Decide whether CORP should be added to a same-origin response.
    // Only needed when it will be loaded as a subresource by a COI page.
    let addCorp = false;
    if (sameOrigin && !applyCoi) {
      addCorp = await clientIsCoi(event.clientId);
    }

    // Fast path: no header changes required.
    if (!applyCoi && !addCorp && !isRunnerAsset) {
      return response;
    }

    const headers = new Headers(response.headers);
    if (applyCoi) {
      headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      headers.set("Cross-Origin-Opener-Policy", "same-origin");
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
    } else if (addCorp) {
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
    }
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
  })());
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
