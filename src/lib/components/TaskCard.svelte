<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import type { Task } from '../types';
	import { formatDate, getRelativeTime, getStatusColor, getStatusIcon } from '../utils';
	import { enableAnimations } from '../stores';

	interface Props {
		task: Task;
		isSelected?: boolean;
		showSelection?: boolean;
		viewMode?: 'grid' | 'list';
		showDragHandle?: boolean;
	}

	let { task, isSelected = false, showSelection = false, viewMode = 'grid', showDragHandle = false }: Props = $props();

	const dispatch = createEventDispatcher<{
		edit: Task;
		delete: Task;
		select: string;
		statusChange: { task: Task; status: Task['status'] };
	}>();

	function handleEdit() {
		dispatch('edit', task);
	}

	function handleDelete() {
		dispatch('delete', task);
	}

	function handleSelect() {
		dispatch('select', task.id);
	}

	function handleStatusChange(newStatus: Task['status']) {
		if (newStatus !== task.status) {
			dispatch('statusChange', { task, status: newStatus });
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (showSelection) {
				handleSelect();
			} else {
				handleEdit();
			}
		}
	}

	const statusColorClass = $derived(getStatusColor(task.status));
	const statusIcon = $derived(getStatusIcon(task.status));
	const isGridView = $derived(viewMode === 'grid');
</script>

<div
	class="task-card {isGridView ? 'grid-view' : 'list-view'} {isSelected ? 'selected' : ''}"
	class:animate={$enableAnimations}
	role="button"
	tabindex="0"
	aria-label="Task: {task.title}"
	aria-selected={isSelected}
	onkeydown={handleKeydown}
	in:fly={{ y: 20, duration: $enableAnimations ? 300 : 0 }}
	out:scale={{ duration: $enableAnimations ? 200 : 0 }}
>
	<div class="card-controls">
		{#if showDragHandle}
			<div class="drag-handle" title="Drag to reorder">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8h16M4 16h16"
					></path>
				</svg>
			</div>
		{/if}

		{#if showSelection}
			<div class="selection-checkbox">
				<input
					type="checkbox"
					checked={isSelected}
					onchange={handleSelect}
					aria-label="Select task {task.title}"
					class="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
				/>
			</div>
		{/if}
	</div>

	<div class="task-content">
		<div class="status-section">
			<span class="status-badge {statusColorClass}" title="{task.status}">
				<span class="status-icon" aria-hidden="true">{statusIcon}</span>
				<span class="status-text">{task.status.replace('-', ' ')}</span>
			</span>
		</div>

		<h3 class="task-title" title={task.title}>
			{task.title}
		</h3>

		{#if task.description}
			<p class="task-description" title={task.description}>
				{task.description}
			</p>
		{/if}

		<div class="task-metadata">
			<div class="metadata-item">
				<span class="metadata-label">Created:</span>
				<time datetime={task.createdAt.toISOString()} title={formatDate(task.createdAt)}>
					{getRelativeTime(task.createdAt)}
				</time>
			</div>
			{#if task.updatedAt.getTime() !== task.createdAt.getTime()}
				<div class="metadata-item">
					<span class="metadata-label">Updated:</span>
					<time datetime={task.updatedAt.toISOString()} title={formatDate(task.updatedAt)}>
						{getRelativeTime(task.updatedAt)}
					</time>
				</div>
			{/if}
		</div>
	</div>

	<div class="task-actions">
		<div class="status-dropdown">
			<select
				value={task.status}
				onchange={(e) => handleStatusChange(e.currentTarget.value as Task['status'])}
				aria-label="Change status for {task.title}"
				class="status-select"
			>
				<option value="pending">Pending</option>
				<option value="in-progress">In Progress</option>
				<option value="completed">Completed</option>
			</select>
		</div>

		<div class="action-buttons">
			<button
				type="button"
				onclick={handleEdit}
				aria-label="Edit task {task.title}"
				class="action-btn edit-btn"
				title="Edit task"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					></path>
				</svg>
			</button>

			<button
				type="button"
				onclick={handleDelete}
				aria-label="Delete task {task.title}"
				class="action-btn delete-btn"
				title="Delete task"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					></path>
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.task-card {
		@apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900;
	}

	.task-card.selected {
		@apply ring-2 ring-primary-500 border-primary-500;
	}

	.task-card.animate {
		@apply transition-all duration-200 ease-in-out;
	}

	.task-card:hover {
		@apply border-gray-300 dark:border-gray-600;
	}

	.task-card.grid-view {
		@apply p-4 flex flex-col gap-3;
	}

	.task-card.list-view {
		@apply p-4 flex flex-row items-center gap-4;
	}

	.selection-checkbox {
		@apply flex-shrink-0;
	}

	.task-content {
		@apply flex-1 min-w-0;
	}

	.grid-view .task-content {
		@apply flex flex-col gap-2;
	}

	.list-view .task-content {
		@apply flex flex-row items-center gap-4 flex-1;
	}

	.card-controls {
		@apply flex items-center gap-2;
	}

	.grid-view .card-controls {
		@apply justify-start;
	}

	.list-view .card-controls {
		@apply flex-shrink-0;
	}

	.status-section {
		@apply flex items-center;
	}

	.status-badge {
		@apply inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium;
	}

	.status-icon {
		@apply text-sm;
	}

	.status-text {
		@apply capitalize;
	}

	.task-title {
		@apply text-lg font-semibold text-gray-900 dark:text-gray-100 truncate;
	}

	.list-view .task-title {
		@apply flex-1 min-w-0;
	}

	.task-description {
		@apply text-sm text-gray-600 dark:text-gray-400 line-clamp-2;
	}

	.list-view .task-description {
		@apply flex-1 min-w-0;
	}

	.task-metadata {
		@apply flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400;
	}

	.list-view .task-metadata {
		@apply flex-row gap-4;
	}

	.metadata-item {
		@apply flex items-center gap-1;
	}

	.metadata-label {
		@apply font-medium;
	}

	.task-actions {
		@apply flex items-center gap-2 flex-shrink-0;
	}

	.grid-view .task-actions {
		@apply justify-between;
	}

	.status-dropdown {
		@apply flex-shrink-0;
	}

	.status-select {
		@apply text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1;
		@apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
		@apply focus:ring-1 focus:ring-primary-500 focus:border-primary-500;
	}

	.action-buttons {
		@apply flex items-center gap-1;
	}

	.action-btn {
		@apply p-1.5 rounded-md transition-colors duration-200;
		@apply text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
	}

	.edit-btn:hover {
		@apply text-primary-600 dark:text-primary-400;
	}

	.delete-btn:hover {
		@apply text-red-600 dark:text-red-400;
	}

	/* Line clamp utility */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
