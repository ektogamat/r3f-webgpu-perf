# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-06-08

### Added

- Online demo deployed on Vercel
- NPM badge and demo link in README
- `npm run build:demo` and `npm run deploy` scripts
- CHANGELOG.md

## [0.1.0] - 2026-06-08

### Added

- `<Perf />` component — drop-in performance monitor for React Three Fiber
- `PerfHeadless`, `PerfPanel`, `usePerf` for custom integrations
- Real-time FPS, GPU/CPU estimates, draw calls, triangles, VRAM
- WebGPU-friendly scene stats fallback when `gl.info` is unavailable
- Circular gauge, history graph, light/dark theme, collapsible stats panel
- TypeScript definitions (`.d.ts`)
