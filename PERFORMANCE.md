# Performance & Faster Page Transitions

## What’s already in place

- **Client-side GET cache** – `src/lib/api.js` caches GET API responses in memory for 30 seconds. Revisiting the same URL (e.g. shop, product list) within that window uses the cache, so navigation feels faster. Cache is cleared on login/logout. Use `clearApiCache()` from `@/lib/api` after mutations if you need fresh lists.
- **Loading UI** – `src/app/(main)/loading.jsx` shows a spinner while the main layout’s children load, so route changes don’t feel stuck.
- **Next.js Link prefetch** – By default, `<Link>` prefetches routes in viewport. Keep using `next/link` for in-app links so prefetch stays enabled.
- **Package import optimization** – `next.config` uses `optimizePackageImports: ["lucide-react"]` so icon imports are tree-shaken.

## Recommendations

### 1. Prefetch important routes (optional)

Links prefetch by default. For key flows (e.g. checkout, shop), keep a single `<Link href="...">` so Next.js can prefetch. Avoid replacing links with `router.push()` only if you don’t need prefetch.

### 2. Heavy components

For large, route-specific components (e.g. XLSX, heavy charts), use dynamic imports so they don’t block the first paint:

```js
import dynamic from "next/dynamic";
const HeavyComponent = dynamic(() => import("./HeavyComponent"), { loading: () => <p>Loading…</p> });
```

### 3. Images

- `next.config` has `images.unoptimized: true`. If you can serve images from a domain you control, set `images.remotePatterns` and set `unoptimized: false` so Next.js can optimize and serve modern formats.
- Use `priority` on above-the-fold images and consistent `width`/`height` (or `fill`) to reduce layout shift.

### 4. Backend and network

- Keep API responses small (e.g. paginate lists, return only needed fields).
- Use HTTP caching headers on the backend for public GET endpoints (e.g. products, categories) when data can be cached by the browser or a CDN.

### 5. Reducing re-renders

- Avoid fetching in the root layout or providers that wrap the whole app if the data is only needed on a few pages; fetch in those pages or their layout instead.
- Use `React.memo` or stable callbacks for list items that receive heavy props.

### 6. Cache TTL

Default GET cache TTL is 30 seconds. To change it, edit `CACHE_TTL` in `src/lib/api.js`. Don’t cache paths like `/user` or `/profile`; they’re excluded in `NO_CACHE_PATHS`.
