<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Sortable from 'sortablejs';
	import type { Task } from '../types';
	import { enableAnimations } from '../stores';

	interface Props {
		items: Task[];
		viewMode: 'grid' | 'list';
		disabled?: boolean;
		children?: any;
	}

	let { items, viewMode, disabled = false, children }: Props = $props();

	const dispatch = createEventDispatcher<{
		reorder: { oldIndex: number; newIndex: number; items: Task[] };
	}>();

	let containerElement: HTMLElement;
	let sortableInstance: Sortable | null = null;

	onMount(() => {
		if (containerElement && !disabled) {
			initializeSortable();
		}
	});

	onDestroy(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
		}
	});

	$effect(() => {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		
		if (containerElement && !disabled) {
			initializeSortable();
		}
	});

	function initializeSortable() {
		if (!containerElement) return;

		sortableInstance = new Sortable(containerElement, {
			animation: $enableAnimations ? 150 : 0,
			ghostClass: 'sortable-ghost',
			chosenClass: 'sortable-chosen',
			dragClass: 'sortable-drag',
			disabled: disabled,
			delay: 100,
			touchStartThreshold: 5,
			
			onStart: () => {
				document.body.classList.add('is-dragging');
			},

			onEnd: (evt) => {
				document.body.classList.remove('is-dragging');
				
				const { oldIndex, newIndex } = evt;
				
				if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
					const reorderedItems = [...items];
					const [movedItem] = reorderedItems.splice(oldIndex, 1);
					reorderedItems.splice(newIndex, 0, movedItem);
					
					dispatch('reorder', {
						oldIndex,
						newIndex,
						items: reorderedItems
					});
				}
			}
		});
	}
</script>

<div
	bind:this={containerElement}
	class="drag-drop-container {viewMode === 'list' ? 'list-container' : 'grid-container'}"
	class:disabled
>
	{@render children?.()}
</div>

<style>
	.drag-drop-container {
		@apply w-full;
	}

	.grid-container {
		@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
	}

	.list-container {
		@apply flex flex-col gap-4;
	}

	.disabled {
		@apply pointer-events-none opacity-75;
	}

	:global(.sortable-ghost) {
		@apply opacity-30 transform scale-95;
	}

	:global(.sortable-chosen) {
		@apply cursor-grabbing;
	}

	:global(.sortable-drag) {
		@apply transform rotate-2 shadow-2xl z-50;
	}

	:global(.drag-handle) {
		@apply cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
		@apply transition-colors duration-200;
	}

	:global(.drag-handle:hover) {
		@apply cursor-grab;
	}

	:global(.is-dragging .drag-handle) {
		@apply cursor-grabbing;
	}

	:global(.is-dragging) {
		@apply select-none;
	}

	:global(.task-card.sortable-chosen) {
		@apply ring-2 ring-primary-500 ring-opacity-50;
	}

	:global(.task-card.sortable-ghost) {
		@apply bg-gray-100 dark:bg-gray-700 border-dashed;
	}

	:global(.task-card.sortable-drag) {
		@apply bg-white dark:bg-gray-800 shadow-xl border-primary-200 dark:border-primary-700;
	}
</style>
