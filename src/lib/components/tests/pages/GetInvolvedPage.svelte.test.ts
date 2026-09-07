import { describe, expect, it } from 'vitest';
import type { JobOpeningData } from '../../../content/types.js';
import { GET_INVOLVED_REASON_KEYS } from '../../../content/pages.js';
import { sampleJobs, samplePageCopy, sampleReasons } from '../../../fixtures.js';
import { createRemoteFormMock } from '../../../testing/remote-form.js';
import type { ContactFormInstance } from '../../contact/ContactForm.svelte';
import GetInvolvedPage from '../../pages/GetInvolvedPage.svelte';
import {
	AFFORDANCES,
	copyEditFor,
	fullAdapter,
	host,
	labelOf,
	messageEdit,
	mountPage,
	rowSpy,
	textOf
} from './helpers.js';

const content = samplePageCopy('get-involved');
const jobs = sampleJobs.map((job, index) => ({ ...job, id: index + 1 }));
const form = createRemoteFormMock<ContactFormInstance>();
const props = { content, jobs, form };

describe('GetInvolvedPage, read-only', () => {
	it('titles itself from the nav key and renders the reasons in declared order, as bare list items', async () => {
		const { container } = mountPage(GetInvolvedPage, { props });
		const page = host(container);

		await expect.poll(() => document.title).toBe("Implica-t'hi — ViT");
		expect(textOf(page, 'h1')).toEqual(["Implica-t'hi"]);
		expect(textOf(page, 'h2')).toEqual([
			content.contact_heading,
			content.funding_heading,
			content.careers_heading
		]);
		expect(textOf(page, '.reasons > li')).toEqual(sampleReasons);
		expect(page.querySelectorAll('.reasons li > *')).toHaveLength(0);
		expect(page.querySelector('form.form-stack')).not.toBeNull();
		expect(page.querySelectorAll('section:last-of-type li')).toHaveLength(jobs.length);
	});

	it('renders zero editing affordances, and byte-identically whether or not descriptors are passed', () => {
		const bare = mountPage(GetInvolvedPage, { props });
		const described = mountPage(GetInvolvedPage, {
			props: {
				...props,
				edit: { copy: copyEditFor('get-involved'), jobs: { entity: 'job_openings' } }
			},
			config: { messageEdit }
		});

		expect(host(bare.container).querySelectorAll(AFFORDANCES)).toHaveLength(0);
		expect(host(described.container).innerHTML).toBe(host(bare.container).innerHTML);
	});
});

describe('GetInvolvedPage, editing', () => {
	it('opens every reason as its own block, asks jobFor per opening and offers the add slot', () => {
		const jobFor = rowSpy<JobOpeningData>();
		const { container } = mountPage(GetInvolvedPage, {
			props: {
				...props,
				edit: { copy: copyEditFor('get-involved'), jobFor, jobs: { entity: 'job_openings' } }
			},
			adapter: fullAdapter(),
			config: { messageEdit }
		});
		const page = host(container);

		expect(labelOf(page, 'h1')).toBe('Text nav_getInvolved');
		expect(
			[...page.querySelectorAll('.reasons > li')].map((li) => li.getAttribute('aria-label'))
		).toEqual(GET_INVOLVED_REASON_KEYS.map((key) => `Bloc ${key}`));
		expect(labelOf(page, '#funding-heading')).toBe('Bloc funding_heading');
		expect(jobFor.mock.calls.map(([j]) => j)).toEqual(jobs);
		expect(page.querySelectorAll('button.add')).toHaveLength(1);
	});
});
