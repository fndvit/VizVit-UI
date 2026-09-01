import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import JobList from '../../jobs/JobList.svelte';
import type { JobOpeningData as JobOpening } from '../../../content/types.js';

/** The empty branch a story enumerated and nothing asserted. */

const job: JobOpening = {
	slug: 'dev',
	title: 'Desenvolupadora',
	description: 'Fer coses.',
	postedOn: '2026-02-01'
};

describe('JobList', () => {
	it('says so when there are no openings', () => {
		render(JobList, { jobs: [] });

		expect(document.querySelectorAll('li')).toHaveLength(0);
		expect(document.querySelector('.empty')).not.toBeNull();
	});

	it('lists an opening with its posted day', () => {
		render(JobList, { jobs: [job] });

		expect(document.querySelectorAll('li')).toHaveLength(1);
		expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-02-01');
	});

	it('omits the description paragraph when there is none', () => {
		render(JobList, { jobs: [{ ...job, description: null }] });

		expect(document.querySelector('li p')).toBeNull();
	});

	it('nudges the newsletter either way, exactly once', () => {
		// The nudge is rendered in both arms of the branch, so it is the one
		// thing that must not double up or go missing when the list empties.
		render(JobList, { jobs: [job] });
		expect(document.querySelectorAll('.nudge')).toHaveLength(1);

		document.body.replaceChildren();
		render(JobList, { jobs: [] });
		expect(document.querySelectorAll('.nudge')).toHaveLength(1);
	});
});
