import { getContext, setContext } from 'svelte';
import { defaultEditMessages } from './edit-messages.js';
import { defaultMessages } from './messages.js';
import { BASE_LOCALE, LOCALES, type UiConfig, type UiConfigInput } from './types.js';

const KEY = Symbol.for('@vit-foundation/ui:config');

/**
 * The provider-less config: identity hrefs, Catalan, no router. Complete on
 * purpose — every component must render without a provider, which is what
 * keeps stories and component tests free of app wiring.
 */
export const DEFAULT_UI_CONFIG: UiConfig = {
	href: (path) => path,
	locale: () => BASE_LOCALE,
	locales: LOCALES,
	url: () => undefined,
	canonicalPathname: (url) => url.pathname,
	siteName: 'ViT',
	messages: defaultMessages,
	editMessages: defaultEditMessages
};

/**
 * Installs the app's config for the subtree. Takes a *thunk* so a provider
 * whose input is a reactive prop stays live: the resolved object delegates
 * every read back through `input()`, and Svelte's reactivity flows through
 * the getters. Called by UiProvider; call it directly only from a layout-like
 * component's init.
 */
export function setUiConfig(input: () => UiConfigInput): UiConfig {
	const resolved: UiConfig = {
		href: (path, options) => (input().href ?? DEFAULT_UI_CONFIG.href)(path, options),
		locale: () => (input().locale ?? DEFAULT_UI_CONFIG.locale)(),
		get locales() {
			return input().locales ?? LOCALES;
		},
		url: () => input().url?.(),
		canonicalPathname: (url) =>
			(input().canonicalPathname ?? DEFAULT_UI_CONFIG.canonicalPathname)(url),
		get siteName() {
			return input().siteName ?? DEFAULT_UI_CONFIG.siteName;
		},
		get messages() {
			return input().messages ?? defaultMessages;
		},
		get editMessages() {
			return input().editMessages ?? defaultEditMessages;
		},
		// Undefined means inert: components render their message strings as
		// plain text, which is every app but the CMS.
		messageEdit: (key) => input().messageEdit?.(key)
	};
	return setContext(KEY, resolved);
}

/** The nearest provider's config, or the standalone defaults. */
export function getUiConfig(): UiConfig {
	return getContext<UiConfig | undefined>(KEY) ?? DEFAULT_UI_CONFIG;
}
