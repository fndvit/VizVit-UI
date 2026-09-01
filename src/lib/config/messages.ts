import type { UiMessages } from './types.js';

/**
 * Catalan fallback copy — the foundation's default UI language. Used whole
 * when no provider is mounted, and never merged key-by-key: `messages` is
 * all-or-nothing so an app cannot ship a half-translated surface silently.
 */
export const defaultMessages: UiMessages = {
	common_readMore: () => 'Llegeix més',
	pagination_label: () => 'Paginació de weeklies',
	pagination_previous: () => 'Anterior',
	pagination_next: () => 'Següent',
	pagination_status: ({ page, pages }) => `Pàgina ${page} de ${pages}`,
	share_label: () => 'Comparteix',
	share_copyLink: () => "Copia l'enllaç",
	share_copied: () => 'Enllaç copiat!',
	form_error_generic: () => 'Hi ha hagut un error. Torna-ho a provar.',
	form_error_rateLimited: () =>
		'Has fet massa intents en poc temps. Espera uns minuts i torna-ho a provar.',
	form_error_unauthenticated: () => 'Per continuar cal iniciar la sessió.',
	form_error_forbidden: () => 'No tens permís per fer aquesta acció.',
	form_error_unavailable: () =>
		'Aquesta acció no està disponible ara mateix. Torna-ho a provar més tard.',
	weeklie_number: ({ number }) => `#${number}`,
	weeklies_sortLabel: () => 'Ordena per',
	weeklies_sortDesc: () => 'Data descendent',
	weeklies_sortAsc: () => 'Data ascendent',
	timeline_label: () => 'Cronologia de fites',
	nav_mainLabel: () => 'Navegació principal',
	nav_home: () => 'Inici',
	nav_menuLabel: () => 'Menú',
	account_navLabel: () => 'El teu compte',
	lang_switcherLabel: () => 'Idioma',
	footer_rights: () => 'Fundació Visualization for Transparency. Tots els drets reservats.',
	jobs_empty: () => 'Ara mateix no tenim cap oferta oberta.',
	jobs_newsletterNudge: () =>
		'Res que encaixi amb el teu perfil? Subscriu-te al butlletí per estar al dia.',
	category_foundation: () => 'Fundació',
	category_lab: () => 'Laboratori',
	category_education: () => 'Educació',
	category_collaboration: () => 'Col·laboració',
	category_press: () => 'Premsa'
};
