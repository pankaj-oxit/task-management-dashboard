<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { Task } from '../types';
	import { enableAnimations } from '../stores';

	interface Props {
		statusFilter: 'all' | Task['status'];
		searchQuery: string;
		sortField: string;
		sortDirection: 'asc' | 'desc';
		taskCount: number;
		viewMode: 'grid' | 'list';
	}

	let {
		statusFilter = 'all',
		searchQuery = '',
		sortField = 'createdAt',
		sortDirection = 'desc',
		taskCount = 0,
		viewMode = 'grid'
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		statusChange: 'all' | Task['status'];
		searchChange: string;
		sortChange: { field: string; direction: 'asc' | 'desc' };
		viewModeChange: 'grid' | 'list';
		clearFilters: void;
	}>();

	let searchInput: HTMLInputElement;

	function handleStatusChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('statusChange', target.value as 'all' | Task['status']);
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('searchChange', target.value);
	}

	function handleSortChange(field: string) {
		if (field === sortField) {
			// Toggle direction if same field
			const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			dispatch('sortChange', { field, direction: newDirection });
		} else {
			// Default to desc for new field
			dispatch('sortChange', { field, direction: 'desc' });
		}
	}

	function handleViewModeToggle() {
		const newMode = viewMode === 'grid' ? 'list' : 'grid';
		dispatch('viewModeChange', newMode);
	}

	function handleClearFilters() {
		dispatch('clearFilters');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && searchQuery) {
			dispatch('searchChange', '');
			searchInput?.blur();
		}
	}

	const hasActiveFilters = $derived(statusFilter !== 'all' || searchQuery.length > 0);
	const filteredText = $derived(taskCount === 1 ? '1 task' : `${taskCount} tasks`);
</script>

<div
	class="filter-bar"
	in:fly={{ y: -10, duration: $enableAnimations ? 200 : 0 }}
>
	<div class="filter-section">
		<div class="search-container">
			<div class="search-input-wrapper">
				<svg
					class="search-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					></path>
				</svg>
				<input
					bind:this={searchInput}
					bind:value={searchQuery}
					oninput={handleSearchInput}
					onkeydown={handleKeydown}
					type="text"
					placeholder="Search tasks..."
					aria-label="Search tasks"
					class="search-input"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => dispatch('searchChange', '')}
						aria-label="Clear search"
						class="clear-search-btn"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<div class="filter-group">
			<label for="status-filter" class="filter-label">Status:</label>
			<select
				id="status-filter"
				bind:value={statusFilter}
				onchange={handleStatusChange}
				class="filter-select"
				aria-label="Filter by status"
			>
				<option value="all">All Status</option>
				<option value="pending">Pending</option>
				<option value="in-progress">In Progress</option>
				<option value="completed">Completed</option>
			</select>
		</div>
	</div>

	<div class="actions-section">
		<div class="sort-group">
			<span class="sort-label">Sort by:</span>
			<div class="sort-buttons">
				<button
					type="button"
					onclick={() => handleSortChange('title')}
					class="sort-btn {sortField === 'title' ? 'active' : ''}"
					aria-label="Sort by title"
				>
					Title
					{#if sortField === 'title'}
						<svg
							class="sort-icon {sortDirection === 'asc' ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					{/if}
				</button>

				<button
					type="button"
					onclick={() => handleSortChange('createdAt')}
					class="sort-btn {sortField === 'createdAt' ? 'active' : ''}"
					aria-label="Sort by creation date"
				>
					Date
					{#if sortField === 'createdAt'}
						<svg
							class="sort-icon {sortDirection === 'asc' ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					{/if}
				</button>

				<button
					type="button"
					onclick={() => handleSortChange('status')}
					class="sort-btn {sortField === 'status' ? 'active' : ''}"
					aria-label="Sort by status"
				>
					Status
					{#if sortField === 'status'}
						<svg
							class="sort-icon {sortDirection === 'asc' ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<div class="view-toggle">
			<button
				type="button"
				onclick={handleViewModeToggle}
				class="view-toggle-btn"
				aria-label="Toggle view mode"
				title="Switch to {viewMode === 'grid' ? 'list' : 'grid'} view"
			>
				{#if viewMode === 'grid'}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						></path>
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						></path>
					</svg>
				{/if}
			</button>
		</div>

		{#if hasActiveFilters}
			<button
				type="button"
				onclick={handleClearFilters}
				class="clear-filters-btn"
				title="Clear all filters"
			>
				Clear
			</button>
		{/if}
	</div>

	<div class="results-info">
		<span class="results-text">
			{#if hasActiveFilters}
				Showing {filteredText}
			{:else}
				{filteredText} total
			{/if}
		</span>
	</div>
</div>

<style>
	.filter-bar {
		@apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4;
		@apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
		@apply shadow-sm;
	}

	.filter-section {
		@apply flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1;
	}

	.search-container {
		@apply flex-1 max-w-md;
	}

	.search-input-wrapper {
		@apply relative;
	}

	.search-icon {
		@apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500;
	}

	.search-input {
		@apply w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md;
		@apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
		@apply placeholder-gray-400 dark:placeholder-gray-500;
		@apply focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
		@apply transition-colors duration-200;
	}

	.clear-search-btn {
		@apply absolute right-3 top-1/2 transform -translate-y-1/2 p-1;
		@apply text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
		@apply rounded-full hover:bg-gray-100 dark:hover:bg-gray-600;
		@apply transition-colors duration-200;
	}

	.filter-group {
		@apply flex items-center gap-2;
	}

	.filter-label {
		@apply text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap;
	}

	.filter-select {
		@apply border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2;
		@apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
		@apply focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
		@apply transition-colors duration-200;
	}

	.actions-section {
		@apply flex items-center gap-4;
	}

	.sort-group {
		@apply flex items-center gap-2;
	}

	.sort-label {
		@apply text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap;
	}

	.sort-buttons {
		@apply flex items-center gap-1;
	}

	.sort-btn {
		@apply inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md;
		@apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
		@apply transition-colors duration-200;
	}

	.sort-btn.active {
		@apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20;
	}

	.sort-icon {
		@apply w-4 h-4 transition-transform duration-200;
	}

	.view-toggle {
		@apply flex items-center;
	}

	.view-toggle-btn {
		@apply p-2 rounded-md;
		@apply text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
		@apply transition-colors duration-200;
	}

	.clear-filters-btn {
		@apply px-3 py-1.5 text-sm font-medium rounded-md;
		@apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100;
		@apply border border-gray-300 dark:border-gray-600;
		@apply hover:bg-gray-50 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
		@apply transition-colors duration-200;
	}

	.results-info {
		@apply flex items-center justify-center sm:justify-end;
	}

	.results-text {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.rotate-180 {
		transform: rotate(180deg);
	}
</style>
