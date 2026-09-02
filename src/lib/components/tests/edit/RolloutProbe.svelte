<script lang="ts">
	import { setEditAdapter } from '../../../edit/context.js';
	import { setUiConfig } from '../../../config/context.js';
	import type { ParameterlessKey } from '../../../config/types.js';
	import type { CollectionRef, EditAdapter, EditDescriptor } from '../../../edit/types.js';
	import type {
		CollaboratorData,
		JobOpeningData,
		ProjectCardData,
		SortDirection,
		TeamMemberData,
		WeeklyCardData
	} from '../../../content/types.js';
	import type { PropertyDescriptor } from '../../../edit/types.js';
	import { createRemoteFormMock } from '../../../testing/remote-form.js';
	import CollaboratorList, { type CollaboratorEditMap } from '../../team/CollaboratorList.svelte';
	import ContactForm, { type ContactFormInstance } from '../../contact/ContactForm.svelte';
	import JobList, { type JobEditMap } from '../../jobs/JobList.svelte';
	import ProjectCard, { type ProjectEditMap } from '../../projects/ProjectCard.svelte';
	import SearchInput from '../../ui/SearchInput.svelte';
	import SortSelect from '../../weeklies/SortSelect.svelte';
	import TeamMemberCard, { type TeamMemberEditMap } from '../../team/TeamMemberCard.svelte';
	import WeeklieCard, { type WeeklyEditMap } from '../../weeklies/WeeklieCard.svelte';

	/**
	 * The Phase-4 rollout surface under a test-owned adapter — one component
	 * per mount, chosen by `show`, with whatever maps or collections the test
	 * hands in. `adapter: null` = read-only app.
	 */
	interface Props {
		adapter?: EditAdapter | null;
		show:
			'weekly' | 'project' | 'member' | 'collaborators' | 'jobs' | 'search' | 'sort' | 'contact';
		weekly?: WeeklyCardData;
		weeklyEdit?: WeeklyEditMap;
		project?: ProjectCardData;
		projectEdit?: ProjectEditMap;
		member?: TeamMemberData;
		memberEdit?: TeamMemberEditMap;
		collaborators?: CollaboratorData[];
		collaboratorsEditFor?: (collaborator: CollaboratorData) => CollaboratorEditMap | undefined;
		collaboratorsCollection?: CollectionRef;
		jobs?: JobOpeningData[];
		jobsEditFor?: (job: JobOpeningData) => JobEditMap | undefined;
		jobsCollection?: CollectionRef;
		placeholderEdit?: PropertyDescriptor;
		optionsEdit?: (direction: SortDirection) => PropertyDescriptor | undefined;
		/** For components resolving their own chrome keys. */
		messageEdit?: (key: ParameterlessKey) => EditDescriptor | undefined;
	}

	let {
		adapter = null,
		show,
		weekly,
		weeklyEdit,
		project,
		projectEdit,
		member,
		memberEdit,
		collaborators = [],
		collaboratorsEditFor,
		collaboratorsCollection,
		jobs = [],
		jobsEditFor,
		jobsCollection,
		placeholderEdit,
		optionsEdit,
		messageEdit
	}: Props = $props();

	// Context is set once at init, on purpose — tests swap adapters by remounting.
	// svelte-ignore state_referenced_locally
	if (adapter) setEditAdapter(adapter);
	// svelte-ignore state_referenced_locally
	if (messageEdit) setUiConfig(() => ({ messageEdit }));
</script>

<div data-testid="host">
	{#if show === 'weekly' && weekly}
		<WeeklieCard {weekly} edit={weeklyEdit} />
	{:else if show === 'project' && project}
		<ProjectCard {project} edit={projectEdit} />
	{:else if show === 'member' && member}
		<TeamMemberCard {member} edit={memberEdit} />
	{:else if show === 'collaborators'}
		<CollaboratorList
			{collaborators}
			editFor={collaboratorsEditFor}
			collection={collaboratorsCollection}
		/>
	{:else if show === 'jobs'}
		<JobList {jobs} editFor={jobsEditFor} collection={jobsCollection} />
	{:else if show === 'search'}
		<SearchInput placeholder="Cerca…" label="Cerca" onsearch={() => {}} {placeholderEdit} />
	{:else if show === 'sort'}
		<SortSelect value="desc" onchange={() => {}} {optionsEdit} />
	{:else if show === 'contact'}
		<ContactForm form={createRemoteFormMock<ContactFormInstance>()} />
	{/if}
</div>
