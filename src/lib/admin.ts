/**
 * Shell-level composition for the foundation's ADMIN apps (Brain and any
 * future internal tool). Primitives stay in /primitives; only what shapes an
 * admin page lives here. The host owns routes, permissions, and auth — these
 * components receive already-filtered data through props, the Nav/Footer
 * genericization pattern.
 */

/*
 * `AdminShell` was exported here — a public name behind two doors with zero
 * readers in either host, no test, and one story. Seven props, five of them
 * forwarded verbatim to `Sidebar`, and the only implementation it added beyond
 * the forwarding was `main { margin-left: 4.5rem }`. The one admin host went
 * the other way: vit-brain imports `Sidebar` directly and composes its own
 * shell with a different offset, so the rail's width had two answers and the
 * untested one was nobody's. Deleting it left nothing to reappear.
 */
export { default as DecorMosaic } from './components/admin/DecorMosaic.svelte';
export { default as PageHeading } from './components/admin/PageHeading.svelte';
export { default as Sidebar, type SidebarItem } from './components/admin/Sidebar.svelte';
