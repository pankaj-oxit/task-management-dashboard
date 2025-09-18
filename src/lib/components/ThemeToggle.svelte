<script lang="ts">
	import { theme, actualTheme, uiActions } from '../stores';

	function handleToggleTheme() {
		uiActions.toggleTheme();
	}

	const themeLabels = {
		light: 'Light',
		dark: 'Dark'
	};

	const themeIcons = {
		light: '☀️',
		dark: '🌙'
	};
</script>

<button
	type="button"
	onclick={handleToggleTheme}
	class="theme-toggle"
	title="Toggle theme ({themeLabels[$theme]})"
	aria-label="Toggle between light and dark theme"
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
		color: rgb(var(--color-text-secondary));
		background-color: rgb(var(--color-bg-secondary));
		border: 1px solid rgb(var(--color-border-primary));
		@apply inline-flex items-center gap-2 px-3 py-2 rounded-md;
		@apply hover:text-gray-900 dark:hover:text-gray-100;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900;
		@apply transition-all duration-200 ease-in-out;
		@apply shadow-sm hover:shadow-md;
	}

	.theme-icon {
		@apply text-lg;
		@apply transition-transform duration-200 ease-in-out;
	}

	.theme-toggle:hover .theme-icon {
		transform: scale(1.1) rotate(10deg);
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
