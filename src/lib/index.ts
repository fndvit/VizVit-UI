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

// Path utilities shared with host apps.
export { buildQueryString, isPathUnder } from './utils/paths.js';
