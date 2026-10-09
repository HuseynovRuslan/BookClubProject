# Landing page — Figma verification screenshots

Evidence for the Bookla landing page pull request (Figma file `8UDMyfuP2zWZIYfEjfRWYR`,
frames "Bookla — Masaüstü" 1440, "Planşet" 768 and "Mobil" 390). All captures come from
the production build (`vite build` + `vite preview`) using Playwright/Chromium at DPR 1.
This folder can be deleted after review.

| Frame | Page height (impl / Figma) | Max text offset (vertical / horizontal) | Pixels differing vs Figma |
|---|---|---|---|
| Desktop 1440 | 6187 / 6187 | 0.00 / 1.66 px | 0.69 % |
| Tablet 768 | 8790 / 8790 | 0.00 / 1.66 px | 0.88 % |
| Mobile 390 | 11264 / 11264 | 0.00 / 1.44 px | 1.14 % |

## Figma vs implementation

Left: Figma · middle: implementation · right: pixelmatch diff (red = differs, yellow = anti-aliasing).

### Desktop 1440
![Figma vs implementation, desktop 1440](figma-vs-implementation-1440.jpg)

### Hero at 1:1 (top: Figma, bottom: implementation)
![Hero detail at 1:1](hero-detail-1440.jpg)

### Tablet 768
![Figma vs implementation, tablet 768](figma-vs-implementation-768.jpg)

### Mobile 390
![Figma vs implementation, mobile 390](figma-vs-implementation-390.jpg)

## Small screens (below the 390 px frame)

Before and after the review fixes, at 360 px and 320 px.

![Small screens before and after](small-screens-before-after.jpg)

## Interaction states

Hover, keyboard focus and the mobile menu. Figma defines no interaction states, so the
resting appearance matches the design and only hover/focus differ.

![Interaction states](interaction-states.jpg)

## Before / after (previous landing page vs this PR)

### 1440
![Before and after, 1440](before-after-1440.jpg)

### 1024
![Before and after, 1024](before-after-1024.jpg)

### 768
![Before and after, 768](before-after-768.jpg)

### 390
![Before and after, 390](before-after-390.jpg)
