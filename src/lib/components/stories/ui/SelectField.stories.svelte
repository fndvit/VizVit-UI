<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from 'storybook/test';
	import SelectField from '../../ui/SelectField.svelte';

	const options = [
		{ value: 'vacation', label: 'Vacances' },
		{ value: 'personal', label: 'Dies personals' },
		{ value: 'justified', label: 'Dies justificats' }
	];

	const { Story } = defineMeta({
		title: 'UI/SelectField',
		component: SelectField,
		args: { id: 'kind', label: 'Tipus', options, onchange: fn() }
	});
</script>

<!-- The default: a labelled box, as a form field. -->
<Story name="Field" args={{ value: 'personal' }} />

<!-- An empty option that MEANS something, next to one that must be chosen past. -->
<Story name="SelectableEmpty" args={{ placeholder: { label: 'Cap' } }} />
<Story name="Placeholder" args={{ placeholder: { label: 'tria…', disabled: true } }} />

<!-- Standing help, and a rejection wired through aria. -->
<Story name="WithHint" args={{ hint: 'Es pot canviar més tard' }} />
<Story name="WithError" args={{ error: 'Tria un tipus' }} />

<!-- The filled toolbar control, label beside it. -->
<Story name="PillInline" args={{ variant: 'pill', inline: true, label: 'Vista' }} />

<!-- Inline chrome: the surroundings label it. -->
<Story name="Bare" args={{ variant: 'bare' }} />

<Story name="Disabled" args={{ disabled: true, value: 'vacation' }} />
