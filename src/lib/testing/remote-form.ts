/**
 * Test/Storybook stand-in for a SvelteKit RemoteForm. Components accept their
 * form as an optional prop defaulting to the real one, so tests and stories
 * substitute through the component's own interface — no module interception.
 * It fakes exactly the surface components render with: the spreadable form
 * attributes, fields.<name>.as()/issues(), fields.allIssues(), result,
 * pending, and the preflight/enhance/for chain. One module — one place to
 * audit when a kit upgrade changes the RemoteForm contract.
 *
 * The type parameter is the prop's type, so a call site reads
 * `createRemoteFormMock<Props['form']>()` and carries no cast of its own.
 *
 * `for(id)` returns a distinct instance per key, and `preflight()` is recorded
 * on the instance it was called on. Both used to return the mock itself, which
 * made a keyed form and its base indistinguishable *by construction*: whether
 * a reply form carried browser-side validation was a question no component
 * test could ask. `preflighted` is the only non-kit member and is test-only.
 */

export type FieldIssues = Array<{ message: string }> | undefined;

export interface RemoteFormMockOptions {
	/** Live result accessor — a function so tests can change it between renders. */
	result?: () => unknown;
	/** Live per-field validation issues, keyed by field name. */
	issues?: () => Record<string, FieldIssues>;
	/**
	 * Live submitting count. A function for the reason `result` is one: a test
	 * that renders a control mid-flight needs to move it between renders.
	 *
	 * Pinned at 0 until `Button` and the reaction chips started reading it —
	 * before that no component rendered `pending`, so the mock not offering it
	 * cost nothing. Now the disabled and aria-busy states depend on it, and a
	 * surface a component renders is exactly what this module exists to fake.
	 */
	pending?: () => number;
}

interface FieldMock {
	as: (type: string, value?: unknown) => Record<string, unknown>;
	issues: () => FieldIssues;
	value: () => undefined;
	set: (input: unknown) => unknown;
}

/** The test-only surface a mock adds on top of kit's RemoteForm. */
export interface RemoteFormProbe {
	/** Whether `preflight()` was called on this instance. */
	readonly preflighted: boolean;
	/** The keyed instance for `id`, as the component under test received it. */
	for(id: string | number): RemoteFormProbe;
}

export function createRemoteFormMock<T = Record<string, unknown>>(
	options: RemoteFormMockOptions = {}
): T {
	const getResult = options.result ?? (() => undefined);
	const getIssues: () => Record<string, FieldIssues> = options.issues ?? (() => ({}));
	const getPending = options.pending ?? (() => 0);

	const field = (name: string): FieldMock => ({
		as: (type, value) =>
			type === 'text'
				? { name, ...(value !== undefined ? { value } : {}) }
				: { name, type, ...(value !== undefined ? { value } : {}) },
		issues: () => getIssues()[name],
		value: () => undefined,
		set: (input) => input
	});

	const roots: Record<string, unknown> = {
		allIssues: () => {
			const all = Object.values(getIssues()).flatMap((entry) => entry ?? []);
			return all.length ? all : undefined;
		}
	};
	const fields = new Proxy(roots, {
		get: (target, prop) => (prop in target ? target[prop as string] : field(String(prop)))
	});

	const keyed = new Map<string, Record<string, unknown>>();

	function build(isKeyed: boolean): Record<string, unknown> {
		let preflighted = false;

		// Only method/action/onsubmit may be enumerable: components spread the
		// form object onto <form>, exactly like the real RemoteForm does.
		const instance: Record<string, unknown> = {
			method: 'POST',
			action: '#mock',
			onsubmit: (event: Event) => event.preventDefault()
		};

		Object.defineProperties(instance, {
			fields: { value: fields },
			result: { get: getResult },
			pending: { get: getPending },
			submitted: { value: false },
			element: { value: null },
			submit: { value: () => Promise.resolve(true) },
			validate: { value: () => Promise.resolve() },
			enhance: { value: () => instance },
			preflight: {
				value: () => {
					preflighted = true;
					return instance;
				}
			},
			preflighted: { get: () => preflighted }
		});

		// kit types `for` as returning Omit<RemoteForm, 'for'>: a keyed instance
		// cannot be keyed again, and the mock says so too.
		if (!isKeyed) {
			Object.defineProperty(instance, 'for', {
				value: (id: string | number) => {
					const key = String(id);
					let child = keyed.get(key);
					if (!child) {
						child = build(true);
						keyed.set(key, child);
					}
					return child;
				}
			});
		}

		return instance;
	}

	return build(false) as T;
}
