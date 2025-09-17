<script lang="ts">
	import { theme, actualTheme, uiActions } from '../stores';

	function handleToggleTheme() {
		uiActions.toggleTheme();
	}

	const themeLabels = {
		light: 'Light',
		dark: 'Dark',
		system: 'System'
	};

	const themeIcons = {
		light: '☀️',
		dark: '🌙',
		system: '💻'
	};
</script>

<button
	type="button"
	onclick={handleToggleTheme}
	class="theme-toggle"
	title="Toggle theme ({themeLabels[$theme]})"
	aria-label="Toggle between light, dark, and system theme"
>
	<span class="theme-icon" aria-hidden="true">
		{themeIcons[$theme]}
	</span>
	<span class="theme-label">
		{themeLabels[$theme]}
	</span>
	<span class="sr-only">
		Current theme: {themeLabels[$theme]} (appears {$actualTheme})
	</span>
</button>

<style>
	.theme-toggle {
		@apply inline-flex items-center gap-2 px-3 py-2 rounded-md;
		@apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
		@apply transition-colors duration-200;
	}

	.theme-icon {
		@apply text-lg;
	}

	.theme-label {
		@apply text-sm font-medium;
	}

	.sr-only {
		@apply absolute w-px h-px p-0 -m-px overflow-hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
