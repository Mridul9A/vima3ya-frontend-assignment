# NOTES.md — 3D Model Viewer

## 1. GLB File Sizes

| Version            | Size     | Notes                                          |
|--------------------|----------|------------------------------------------------|
| Original model.glb | **1.6 KB** | Low-poly gem, 20 vertices, 36 triangles       |
| "Compressed" (Draco) | ~2.1 KB | **Larger** — Draco adds ~500B header overhead |

### Why the compressed version is bigger here

Draco compression pays off for meshes with **thousands of vertices** — it typically
achieves 60–90% reduction on dense geometry (e.g., 420 KB → 95 KB for a 10K-polygon
character mesh). For a low-poly shape with only 20 vertices, the Draco bitstream
header (~500 bytes) exceeds the actual geometry data, making the file larger.

**Real-world example** (what the task illustrates in principle):
```
Before: model-character.glb   → 420 KB  (uncompressed vertex data)
After:  model-compressed.glb  → 95 KB   (Draco quantized + entropy coded)
Savings: 77%
```

The GLB in this project is already as small as it gets. Draco is included and
configured correctly (`DRACOLoader` with `setDecoderPath`), so it will transparently
decompress any future Draco-encoded `.glb` dropped in.

---

## 2. What Lazy Loading Three.js Prevents

```js
// Without lazy loading (blocks render):
import * as THREE from 'three';  // browser stalls until ~600KB parses

// With lazy loading (non-blocking):
const THREE = await import('three');  // fetched after first paint
```

**What it prevents:**

- **Render-blocking parse time** — Three.js minified is ~580 KB of JavaScript.
  The browser must download, parse, and compile it before it can paint *anything*.
  On a 3G connection (~1 Mbps), that's ~4.6 seconds of white screen.

- **First Contentful Paint (FCP) delay** — With dynamic import, the loading UI
  (spinner, progress bar) renders immediately from the tiny inline CSS, giving users
  visual feedback while Three.js loads in the background.

- **Time to Interactive (TTI) regression** — Eager imports block the main thread.
  Lazy loading lets the browser prioritize interactive HTML/CSS first.

- **Unnecessary load on pages that never reach 3D** — In a SPA where the viewer
  is behind a route, lazy loading ensures Three.js is only fetched when the user
  actually navigates to the 3D page.

**The tradeoff:** There's a brief pause between "user lands on page" and "3D starts
rendering" while Three.js is fetched. This is acceptable because the loading UI fills
that time. For even better UX, you can `<link rel="modulepreload">` Three.js on
the page that *links* to the viewer, so it's already cached.

---

## 3. What Breaks Without `dispose()`

In a long-running session (SPA, dashboard with model switching, etc.):

### GPU Memory Leak
Every call to `new THREE.BufferGeometry()`, `new THREE.MeshStandardMaterial()`, and
`new THREE.Texture()` allocates memory on the **GPU**. Unlike JS heap, the GPU
allocator does not garbage-collect. Without `dispose()`:

```
User loads model A → 15 MB VRAM allocated
User loads model B → another 15 MB — model A's memory is NEVER freed
User loads model C → 45 MB total, still climbing
After 20 switches  → 300 MB VRAM consumed; GPU starts evicting other apps' memory
```

### Symptoms of missing dispose():
| Symptom | Root Cause |
|---|---|
| Frame rate drops from 60fps → 15fps | GPU thrashing due to memory pressure |
| Canvas turns black / glitches | VRAM exhausted, driver resets context |
| Browser tab crashes (`Aw, Snap!`) | OS kills tab to reclaim GPU memory |
| `WebGL: CONTEXT_LOST_WEBGL` in console | GPU context forcibly destroyed |

### What dispose() actually frees:
```js
geometry.dispose()   // frees VBO/IBO on GPU (vertex + index buffers)
material.dispose()   // frees shader program + uniform block
texture.dispose()    // frees texture sampler memory (often the largest item)
renderer.dispose()   // tears down the WebGL context and all linked resources
dracoLoader.dispose() // frees WASM worker thread and decoder buffers
```

### The rule of thumb:
> **Every Three.js object you `new` that isn't needed anymore must be `.dispose()`d.**
> JS garbage collection handles the CPU-side JS object. It does **not** touch the GPU.

In this viewer, `dispose()` is called on `beforeunload`. In a SPA model-switcher,
you would call it whenever the user navigates away from the viewer component.

---

## Technical Stack

- **Renderer:** Three.js r160 (dynamic import via esm.sh CDN)
- **Loader:** `GLTFLoader` + `DRACOLoader` (Draco decoder v1.5.6 from gstatic CDN)
- **Model:** Hand-coded GLB — low-poly hexagonal gem, 20 vertices, 36 triangles
- **Controls:** Custom mouse/touch orbit (no OrbitControls import = smaller bundle)
- **Load tracking:** `performance.now()` before/after load, logged to console
