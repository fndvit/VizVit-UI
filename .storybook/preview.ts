import type { Preview } from '@storybook/sveltekit';
import '../src/lib/styles/tokens.css';
import '../src/lib/styles/base.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
