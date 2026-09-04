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

// Path utilities shared with host apps — the two that a host actually reads.
// `isInternalPath` and `isExternalUrl` are NOT exported: they are the
// destination classifiers `Link` and `TimelineMilestone` branch on, both
// reached by a deep import inside this package, and nothing outside it ever
// asked. Publishing them would pin two regexes into semver for no reader;
// `paths.test.ts` is what holds them instead.
export { buildQueryString, isPathUnder } from './utils/paths.js';
