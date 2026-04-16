# vima3ya-frontend-assignment

Frontend Engineering Assignment — Vima3ya
Role: Software Engineer – Product & Performance (React.js)

This repository contains two independent tasks demonstrating React form architecture, scroll-synced navigation, 3D model rendering, and performance optimization.

---

## Repository Structure

```
vima3ya-frontend-assignment/
├── README.md              ← You are here
├── task-1/                ← Multi-section form with scroll navigation
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── validation/
│   │   │   └── schema.js
│   │   ├── hooks/
│   │   │   └── useScrollTracker.js
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── Section.jsx
│   │       ├── FormField.jsx
│   │       └── Loader.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── task-2/                ← 3D GLB model viewer with Three.js
    ├── index.html
    ├── model.glb
    └── NOTES.md
```

---

## Quick Start

### Task 1

```bash
cd task-1
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Task 2

```bash
cd task-2
npx serve .
```

Runs at `http://localhost:3000`

> Task 2 must be served over HTTP — opening `index.html` directly via `file://` will fail due to CORS restrictions on ES module imports.

---

---

# Task 1 — Reusable Form System with Scroll Navigation

## What It Does

A single-page React app with a two-column layout:

- **Left column** — Fixed sidebar with 4 navigation bullets (Section A, B, C, D) that highlight cumulatively as the user scrolls
- **Right column** — Scrollable area with 4 form sections, each containing 2 input fields

## Features

| Feature | Details |
|---|---|
| Reusable `<FormField />` | Accepts `name`, `placeholder`, `validator`, `errorMessage` props |
| Validation timing | Errors appear only after Submit is clicked, then update live as user types |
| Auto-trigger | Once all fields are valid, `onFormComplete()` fires automatically — no second click needed |
| Re-trigger on change | After first valid completion, `onFormComplete()` fires on every subsequent change while form stays valid |
| Shimmer loader | `onFormComplete()` triggers a 3-second skeleton loader simulating an API call |
| Scroll-synced sidebar | Bullets highlight cumulatively and stay highlighted once scrolled past |
| Smooth scroll | Clicking a sidebar bullet scrolls to that section |

## Form Sections

| Section | Fields |
|---|---|
| A — Personal Info | Name, Email |
| B — Contact | Phone, Address |
| C — Location | City, State |
| D — Work | Company, Role |

## Validation Rules

| Field | Rule |
|---|---|
| `name` | Required |
| `email` | Required, valid email format |
| `phone` | Required, exactly 10 digits |
| `address` | Required |
| `city` | Required |
| `state` | Required |
| `company` | Required |
| `role` | Required |

## How It Works

### Submission & Auto-trigger Flow

```
User clicks Submit
      │
      ▼
setSubmitted(true)         ← unlocks error display on all fields
      │
      ▼
validateForm()             ← Formik runs Yup schema
      │
   ┌──┴──────────────────┐
has errors?           no errors?
   │                       │
   ▼                       ▼
Fields show            onFormComplete()
errors                 setLoading(true) → 3s → setLoading(false)

After submitted = true:
useEffect watches values →
  all fields filled & valid? → onFormComplete() fires again automatically
```

### Scroll Tracking — `useScrollTracker`

Uses `IntersectionObserver` with `threshold: 0.4`. When 40% of a section enters the viewport, its index is added to `activeSections`. Sections are never removed from the active list — bullets stay highlighted once passed.

```js
const observer = new IntersectionObserver((entries) => {
  setActiveSections(prev => {
    let updated = [...prev];
    entries.forEach(entry => {
      const index = Number(entry.target.dataset.index);
      if (entry.isIntersecting && !updated.includes(index)) {
        updated.push(index);
      }
    });
    return updated.sort();
  });
}, { threshold: 0.4 });
```

### `<FormField />` Component

Accepts a `validator` prop (`"email"` | `"phone"` | `"required"`) or an optional custom `errorMessage`. Falls back to `"This field is required"` if neither is provided. Errors only render when the parent passes `submitted={true}`.

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI and state |
| Formik | Form state management and submission |
| Yup | Schema-based validation |
| Vite | Dev server and bundler |
| IntersectionObserver API | Scroll tracking (no external dependency) |

---

---

# Task 2 — 3D Model Viewer with Three.js (Optimized Loading)

## What It Does

A standalone HTML page that loads and renders a Draco-compressed `.glb` 3D model using Three.js, with lazy loading, a visible loading indicator, load-time logging, and full memory cleanup.

## Features

| Feature | Details |
|---|---|
| Custom GLB model | Low-poly hexagonal gem — 20 vertices, 36 triangles, built programmatically |
| Draco-compressed | Model exported with Draco compression via `gltf-pipeline` |
| DRACOLoader configured | Decoder path set to Draco v1.5.6 on Google's CDN |
| Loading indicator | Animated gem spinner + progress bar visible while model loads |
| Load time logging | `console.log("Model loaded in Xms")` using `performance.now()` |
| Lazy Three.js | All Three.js modules loaded via dynamic `import()` after first paint |
| Orbit controls | Click-drag to rotate, scroll to zoom, touch supported |
| Memory cleanup | `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, `dracoLoader.dispose()` called on `beforeunload` |

## How to Run

```bash
cd task-2
npx serve .
# open http://localhost:3000
```

## Implementation Details

### Step 2 — GLTFLoader with DRACOLoader

```js
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const start = performance.now();

loader.load('./model.glb', (gltf) => {
  console.log(`Model loaded in ${(performance.now() - start).toFixed(2)}ms`);
  // remove loader, show model
});
```

### Step 3 — Lazy Loading Three.js

```js
// Three.js (~580KB) is fetched only after the loading UI renders
const [THREE, { GLTFLoader }, { DRACOLoader }] = await Promise.all([
  import('https://esm.sh/three@0.160.0'),
  import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'),
  import('https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js'),
]);
```

All three modules load in parallel. The spinner is visible immediately from pure CSS — no JS required for first paint.

### Memory Cleanup

```js
window.addEventListener('beforeunload', () => {
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry.dispose();
      obj.material.dispose();
    }
  });
  renderer.dispose();
  dracoLoader.dispose();
});
```

## NOTES.md Summary

### File Sizes

| Version | Size |
|---|---|
| `model.glb` (original) | 1.6 KB |
| After Draco compression | ~2.1 KB (larger due to Draco header overhead on tiny meshes) |

Draco compression delivers significant savings on dense geometry (e.g. 420 KB → 95 KB for a 10K-polygon mesh). For this low-poly model with only 20 vertices, the Draco bitstream header outweighs the geometry data. The loader is correctly configured to transparently decompress any Draco-encoded `.glb`.

### What Lazy Loading Prevents

Three.js minified is ~580 KB of JavaScript. Without dynamic import, the browser must download, parse, and compile it before painting anything — causing a blank screen for several seconds on slow connections. Dynamic import means:

- The loading UI renders immediately from CSS (zero JS required)
- First Contentful Paint (FCP) is not blocked
- Three.js is only fetched when the 3D viewer is actually needed
- In a SPA, Three.js is never loaded on pages that don't use it

### What Breaks Without `dispose()`

GPU memory is not garbage collected by JavaScript. Every `BufferGeometry`, `Material`, and `Texture` allocates VRAM. Without `dispose()`:

- VRAM usage grows on every model load or scene rebuild
- Frame rate degrades as the GPU thrashes under memory pressure
- The canvas turns black or glitches (`CONTEXT_LOST_WEBGL` in console)
- The browser tab crashes on low-VRAM devices

---

## Notes on AI Tool Usage

AI tools were used during development of this assignment. Every decision in the code is understood and explainable:

- The `useEffect` inside Formik's render prop and why it works but technically violates Rules of Hooks — and the fix (extract an `InnerForm` component)
- Why `threshold: 0.4` was chosen for `IntersectionObserver` and how cumulative highlighting differs from live highlighting
- Why Draco compression increases file size for low-poly geometry and when it provides real gains
- Why `dispose()` targets GPU memory specifically, not JS heap, and what symptoms appear when it is skipped
- Why all three Three.js imports are fetched in `Promise.all()` rather than sequentially