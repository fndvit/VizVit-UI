// The whole surface, flat — importable piecemeal through the semantic
// subpaths: ./primitives, ./forms, ./chrome, ./content, ./community,
// ./edit, ./config, ./admin, ./testing.
export * from './primitives.js';
export * from './chrome.js';
export * from './content-components.js';
export * from './community.js';
export * from './admin.js';

// The form seam: form components, structural remote-form types, transport
// constants, field bounds.
export * from './forms/index.js';

// App wiring: configuration context and the edit-mode contract.
export * from './config/index.js';
export * from './edit/index.js';

// The one path utility a host actually reads: fndvit-website re-exports
// `buildQueryString` from its own `utils/nav.ts`, so the URL a list mirrors
// and the hrefs it renders are spelled by this function in both codebases.
// The other three are NOT exported. `isInternalPath` and `isExternalUrl` are
// the destination classifiers `Link` and `TimelineMilestone` branch on, and
// `isPathUnder` is the prefix match `Nav` and `Sidebar` highlight the current
// section with — all four in-package readers reach them by deep import, and
// no host imports any of the three. Exporting them would pin their behaviour
// into semver for no reader; `paths.test.ts` is what holds them instead.
export { buildQueryString } from './utils/paths.js';
