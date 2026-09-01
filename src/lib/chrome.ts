/**
 * Site chrome: the shell every page renders through, and the header/footer
 * pair. Nav and Footer take the same SiteLink[] so the two can never drift.
 */
export { default as Footer } from './components/layout/Footer.svelte';
export { default as Nav } from './components/layout/Nav.svelte';
export { default as PageShell } from './components/layout/PageShell.svelte';
