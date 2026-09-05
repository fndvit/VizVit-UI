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

// The one path utility this BARREL carries. The destination classifiers are
// server-side rules, so they go through ./contract instead — see the note in
// utils/paths.ts, which is where the export surface for all of them is decided.
export { buildQueryString } from './utils/paths.js';
