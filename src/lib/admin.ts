/**
 * Shell-level composition for the foundation's ADMIN apps (Brain and any
 * future internal tool). Primitives stay in /primitives; only what shapes an
 * admin page lives here. The host owns routes, permissions, and auth — these
 * components receive already-filtered data through props, the Nav/Footer
 * genericization pattern.
 */
export { default as AdminShell } from './components/admin/AdminShell.svelte';
export { default as DecorMosaic } from './components/admin/DecorMosaic.svelte';
export { default as PageHeading } from './components/admin/PageHeading.svelte';
export { default as Sidebar, type SidebarItem } from './components/admin/Sidebar.svelte';
