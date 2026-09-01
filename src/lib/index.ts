// Components, by group.
export * from './components/account/index.js';
export * from './components/auth/index.js';
export * from './components/contact/index.js';
export * from './components/ui/index.js';
export * from './components/layout/index.js';
export * from './components/weeklies/index.js';
export * from './components/projects/index.js';
export * from './components/team/index.js';
export * from './components/timeline/index.js';
export * from './components/jobs/index.js';

// The form seam: structural remote-form types, transport constants, field bounds.
export * from './forms/index.js';

// App wiring: configuration context and the edit-mode contract.
export * from './config/index.js';
export * from './edit/index.js';

// Content shapes and the rich-text mini-format.
export * from './content/index.js';

// Utilities the components share with their host apps.
export { formatDate, yearOf } from './utils/dates.js';
export { contactCategoryLabel } from './utils/contact.js';
export { MILESTONE_CATEGORY_COLOR, milestoneCategoryLabel } from './utils/milestones.js';
export { isPathUnder } from './utils/paths.js';
