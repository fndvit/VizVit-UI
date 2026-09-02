<script lang="ts">
	import { setUiConfig } from '../../../config/context.js';
	import type { ParameterlessKey, SiteLink } from '../../../config/types.js';
	import { setEditAdapter } from '../../../edit/context.js';
	import type { CollectionRef, EditAdapter, EditDescriptor } from '../../../edit/types.js';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import type { NewsletterToggleFormInstance } from '../../account/AccountPanel.svelte';
	import NewsletterSignup from '../../account/NewsletterSignup.svelte';
	import Footer from '../../layout/Footer.svelte';
	import Nav from '../../layout/Nav.svelte';
	import type { SiteLinkEditMap } from '../../layout/site-link-edit.js';

	/**
	 * This branch's surface under a test-owned adapter: the nav/footer link
	 * frames and the newsletter's ActionLabel'd links. `adapter: null` =
	 * read-only app.
	 */
	interface Props {
		adapter?: EditAdapter | null;
		show: 'nav' | 'footer' | 'newsletter';
		links?: SiteLink[];
		editFor?: (link: SiteLink) => EditDescriptor | undefined;
		propertiesFor?: (link: SiteLink) => SiteLinkEditMap | undefined;
		collection?: CollectionRef;
		/** For components resolving their own chrome keys. */
		messageEdit?: (key: ParameterlessKey) => EditDescriptor | undefined;
	}

	let {
		adapter = null,
		show,
		links = [],
		editFor = undefined,
		propertiesFor = undefined,
		collection = undefined,
		messageEdit = undefined
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
	setUiConfig(() => ({ messageEdit }));
</script>

{#if show === 'nav'}
	<Nav {links} {editFor} {propertiesFor} {collection} />
{:else if show === 'footer'}
	<Footer {links} {editFor} {propertiesFor} {collection} />
{:else}
	<NewsletterSignup
		account={null}
		newsletterToggleForm={createRemoteFormMock<NewsletterToggleFormInstance>()}
	/>
{/if}
