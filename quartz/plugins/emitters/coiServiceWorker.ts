import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"

// Cross-Origin Isolation service worker.
//
// Applies COOP/COEP headers *only* to pages that opt in — where "opt in"
// means the HTML body contains a <script src="/static/js/code-runner.js" ...>
// tag. The SW sniffs the response body on every top-level HTML navigation
// and adds COI headers only when it sees the marker script tag. Every
// other page is served untouched, so cross-origin iframes (e.g. Karakeep,
// YouTube), Google Fonts, and any other cross-origin subresource load
// normally across the rest of the site.
//
// Author experience: opting a new page into runnable code requires only
// the single <script> tag in that page's markdown — no code, no config,
// no allowlist to maintain.
//
// Performance: HTML pages on a blog are typically 30–100 KB. Reading a
// response of that size to text in a service worker adds ~1–5 ms per
// top-level navigation. Sub-resources (JS, CSS, images) skip the sniff
// entirely and remain streaming.
//
// Based on the coi-serviceworker pattern (https://github.com/gzuidhof/coi-serviceworker).
// Uses the stricter `require-corp` COEP (rather than `credentialless`)
// because Firefox does not yet support `credentialless`.
const SW_SOURCE = `/* eslint-disable */
/* COI service worker: sniff-based opt-in.
 *
 * If a top-level HTML response contains a <script src="/static/js/code-runner.js" ...>
 * tag, the SW adds Cross-Origin-Opener-Policy: same-origin and
 * Cross-Origin-Embedder-Policy: require-corp so the page becomes cross-
 * origin isolated (needed by webR / Pyodide for SharedArrayBuffer).
 * All other pages pass through untouched.
 */

// Matches the exact script tag that opts a page into runnable code.
// Deliberately strict: requires a script tag with an explicit src attribute
// pointing at /static/js/code-runner.js — a bare mention of the filename
// in prose won't trigger it.
const CODE_RUNNER_TAG = /<script\\b[^>]*\\bsrc=["']\\/static\\/js\\/code-runner\\.js["']/i;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

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

    const isNavigation = event.request.mode === "navigate";
    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");

    // Path 1: same-origin top-level HTML navigation.
    // Sniff the body for the code-runner script tag and apply COI headers
    // only when it's present.
    if (sameOrigin && isNavigation && isHtml) {
      const text = await response.text();
      const needsCoi = CODE_RUNNER_TAG.test(text);
      const headers = new Headers(response.headers);
      if (needsCoi) {
        headers.set("Cross-Origin-Embedder-Policy", "require-corp");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");
        headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      }
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // Path 2: same-origin subresources (JS, CSS, images, fonts, etc.).
    // Add CORP so they can be loaded by cross-origin-isolated pages.
    // Harmless for non-COI pages — CORP: cross-origin just says
    // "any origin may load me", which is already the default behaviour
    // for a public blog. Also stamp Cache-Control on runner assets so
    // future deploys take effect immediately.
    if (sameOrigin) {
      const headers = new Headers(response.headers);
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      if (isRunnerAsset) {
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // Path 3: cross-origin. Pass through untouched — do NOT rewrite the
    // response, as that would strip CORS headers or otherwise break
    // legitimate cross-origin fetches (webR, Pyodide, package binaries,
    // iframes to other sites, etc.).
    return response;
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
