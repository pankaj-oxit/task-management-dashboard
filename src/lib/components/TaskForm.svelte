<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { Task, CreateTaskData, UpdateTaskData } from '../types';
	import { validateTaskTitle, validateTaskDescription } from '../utils';
	import { enableAnimations } from '../stores';

	interface Props {
		task?: Task | null;
		isSubmitting?: boolean;
	}

	let { task = null, isSubmitting = false }: Props = $props();

	const dispatch = createEventDispatcher<{
		submit: CreateTaskData | { id: string; data: UpdateTaskData };
		cancel: void;
	}>();

	// Form state
	let title = $state(task?.title || '');
	let description = $state(task?.description || '');
	let status = $state<Task['status']>(task?.status || 'pending');

	// Validation state
	let titleError = $state<string | null>(null);
	let descriptionError = $state<string | null>(null);
	let hasValidated = $state(false);

	// Reactive validation
	$effect(() => {
		if (hasValidated) {
			titleError = validateTaskTitle(title);
			descriptionError = validateTaskDescription(description);
		}
	});

	const isValid = $derived(!titleError && !descriptionError && title.trim().length > 0);
	const isEditing = $derived(task !== null);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		hasValidated = true;

		titleError = validateTaskTitle(title);
		descriptionError = validateTaskDescription(description);

		if (!isValid || isSubmitting) return;

		const formData: CreateTaskData = {
			title: title.trim(),
			description: description.trim() || undefined,
			status,
		};

		if (isEditing && task) {
			dispatch('submit', {
				id: task.id,
				data: formData,
			});
		} else {
			dispatch('submit', formData);
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	// Focus management
	let titleInput: HTMLInputElement;

	$effect(() => {
		if (titleInput) {
			titleInput.focus();
		}
	});
</script>

<div
	class="task-form-container"
	in:fly={{ y: -20, duration: $enableAnimations ? 300 : 0 }}
	out:fly={{ y: -20, duration: $enableAnimations ? 200 : 0 }}
	onkeydown={handleKeydown}
>
	<form onsubmit={handleSubmit} class="task-form">
		<div class="form-header">
			<h2 class="form-title">
				{isEditing ? 'Edit Task' : 'Create New Task'}
			</h2>
		</div>

		<div class="form-content">
			<!-- Title Field -->
			<div class="form-field">
				<label for="task-title" class="form-label">
					Title <span class="required-indicator" aria-label="required">*</span>
				</label>
				<input
					bind:this={titleInput}
					bind:value={title}
					type="text"
					id="task-title"
					name="title"
					placeholder="Enter task title..."
					required
					maxlength="100"
					class="form-input {titleError ? 'error' : ''}"
					aria-describedby={titleError ? 'title-error' : undefined}
					aria-invalid={!!titleError}
				/>
				{#if titleError}
					<div id="title-error" class="error-message" role="alert">
						{titleError}
					</div>
				{/if}
				<div class="character-count">
					{title.length}/100
				</div>
			</div>

			<!-- Description Field -->
			<div class="form-field">
				<label for="task-description" class="form-label">Description</label>
				<textarea
					bind:value={description}
					id="task-description"
					name="description"
					placeholder="Enter task description (optional)..."
					rows="4"
					maxlength="500"
					class="form-input {descriptionError ? 'error' : ''}"
					aria-describedby={descriptionError ? 'description-error' : undefined}
					aria-invalid={!!descriptionError}
				></textarea>
				{#if descriptionError}
					<div id="description-error" class="error-message" role="alert">
						{descriptionError}
					</div>
				{/if}
				<div class="character-count">
					{description.length}/500
				</div>
			</div>

			<!-- Status Field -->
			<div class="form-field">
				<label for="task-status" class="form-label">Status</label>
				<select bind:value={status} id="task-status" name="status" class="form-input">
					<option value="pending">Pending</option>
					<option value="in-progress">In Progress</option>
					<option value="completed">Completed</option>
				</select>
			</div>
		</div>

		<div class="form-actions">
			<button
				type="button"
				onclick={handleCancel}
				class="btn-secondary"
				disabled={isSubmitting}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="btn-primary"
				disabled={!isValid || isSubmitting}
				aria-describedby="submit-status"
			>
				{#if isSubmitting}
					<svg
						class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					{isEditing ? 'Updating...' : 'Creating...'}
				{:else}
					{isEditing ? 'Update Task' : 'Create Task'}
				{/if}
			</button>
		</div>

		<div id="submit-status" class="sr-only" aria-live="polite">
			{#if isSubmitting}
				{isEditing ? 'Updating task...' : 'Creating task...'}
			{/if}
		</div>
	</form>
</div>

<style>
	.task-form-container {
		@apply w-full max-w-md mx-auto;
	}

	.task-form {
		background-color: rgb(var(--color-surface-elevated));
		border: 1px solid rgb(var(--color-border-primary));
		@apply rounded-lg shadow-lg flex flex-col;
	}

	.form-header {
		border-bottom: 1px solid rgb(var(--color-border-primary));
		@apply px-6 py-4;
	}

	.form-title {
		color: rgb(var(--color-text-primary));
		@apply text-xl font-semibold;
	}

	.form-content {
		@apply px-6 py-4 flex flex-col gap-4;
	}

	.form-field {
		@apply flex flex-col gap-2;
	}

	.form-label {
		color: rgb(var(--color-text-secondary));
		@apply block text-sm font-medium;
	}

	.required-indicator {
		@apply text-red-500 ml-1;
	}

	.form-input {
		background-color: rgb(var(--color-bg-secondary));
		border: 1px solid rgb(var(--color-border-secondary));
		color: rgb(var(--color-text-primary));
		@apply block w-full rounded-md shadow-sm sm:text-sm;
		@apply focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400;
		@apply placeholder-gray-400 dark:placeholder-gray-500;
		@apply transition-all duration-200 ease-in-out;
	}

	.form-input.error {
		@apply border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500;
	}

	.form-input:disabled {
		@apply bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed;
	}

	.error-message {
		@apply text-sm text-red-600 dark:text-red-400;
	}

	.character-count {
		color: rgb(var(--color-text-tertiary));
		@apply text-xs text-right;
	}

	.form-actions {
		background-color: rgb(var(--color-bg-tertiary));
		@apply px-6 py-4 rounded-b-lg;
		@apply flex items-center justify-end gap-3;
	}

	.btn-primary {
		@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md;
		@apply text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
		@apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600;
		@apply transition-colors duration-200;
	}

	.btn-secondary {
		background-color: rgb(var(--color-bg-secondary));
		border: 1px solid rgb(var(--color-border-primary));
		color: rgb(var(--color-text-primary));
		@apply inline-flex items-center px-4 py-2 text-sm font-medium rounded-md;
		@apply hover:bg-gray-50 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900;
		@apply disabled:opacity-50 disabled:cursor-not-allowed;
		@apply transition-all duration-200 ease-in-out;
	}

	.sr-only {
		@apply absolute w-px h-px p-0 -m-px overflow-hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
