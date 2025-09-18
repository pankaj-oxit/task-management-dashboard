<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import {
		TaskCard,
		TaskForm,
		FilterBar,
		ConfirmationDialog,
		Modal,
		NotificationToast,
		ThemeToggle,
		DragDropList
	} from '$lib/components';
	import {
		tasks,
		filteredTasks,
		taskStats,
		taskActions,
		filterStatus,
		searchQuery,
		sortField,
		sortDirection,
		isLoading,
		error
	} from '$lib/stores/taskStore';
	import {
		isCreateModalOpen,
		isEditModalOpen,
		isDeleteModalOpen,
		editingTask,
		deletingTask,
		viewMode,
		notifications,
		uiActions,
		enableAnimations,
		isDragDropEnabled
	} from '$lib/stores/uiStore';

	onMount(() => {
		taskActions.loadTasks();
	});
	async function handleCreateTask(event: CustomEvent) {
		const taskData = event.detail;
		const newTask = await taskActions.createTask(taskData);
		
		if (newTask) {
			uiActions.closeCreateModal();
			uiActions.addNotification({
				type: 'success',
				title: 'Task created',
				message: `"${newTask.title}" has been created successfully.`
			});
		}
	}

	async function handleEditTask(event: CustomEvent) {
		const { id, data } = event.detail;
		const updatedTask = await taskActions.updateTask(id, data);
		
		if (updatedTask) {
			uiActions.closeEditModal();
			uiActions.addNotification({
				type: 'success',
				title: 'Task updated',
				message: `"${updatedTask.title}" has been updated successfully.`
			});
		}
	}

	async function handleDeleteTask() {
		if ($deletingTask) {
			const success = await taskActions.deleteTask($deletingTask.id);
			
			if (success) {
				uiActions.closeDeleteModal();
				uiActions.addNotification({
					type: 'success',
					title: 'Task deleted',
					message: `"${$deletingTask.title}" has been deleted.`
				});
			}
		}
	}

	async function handleStatusChange(event: CustomEvent) {
		const { task, status } = event.detail;
		await taskActions.updateTask(task.id, { status });
	}

	function handleStatusFilter(event: CustomEvent) {
		filterStatus.set(event.detail);
	}

	function handleSearchChange(event: CustomEvent) {
		searchQuery.set(event.detail);
	}

	function handleSortChange(event: CustomEvent) {
		const { field, direction } = event.detail;
		sortField.set(field);
		sortDirection.set(direction);
	}

	function handleViewModeChange(event: CustomEvent) {
		uiActions.setViewMode(event.detail);
	}

	function handleClearFilters() {
		taskActions.resetFilters();
	}

	function handleTaskEdit(event: CustomEvent) {
		uiActions.openEditModal(event.detail);
	}

	function handleTaskDelete(event: CustomEvent) {
		uiActions.openDeleteModal(event.detail);
	}

	function handleTaskReorder(event: CustomEvent) {
		const { items: reorderedItems } = event.detail;
		taskActions.reorderTasks(reorderedItems);
		
		uiActions.addNotification({
			type: 'success',
			title: 'Tasks reordered',
			message: 'Task order has been updated successfully.'
		});
	}

	function handleErrorDismiss() {
		taskActions.clearError();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 'n':
					event.preventDefault();
					uiActions.openCreateModal();
					break;
				case 'f':
					event.preventDefault();
					const searchInput = document.querySelector('[placeholder="Search tasks..."]') as HTMLInputElement;
					searchInput?.focus();
					break;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="dashboard-container">
	<header class="dashboard-header">
		<div class="header-content">
			<div class="header-title">
				<h1 class="title">Task Management Dashboard</h1>
				<p class="subtitle">Organize and track your tasks efficiently</p>
			</div>
			
			<div class="header-actions">
				<ThemeToggle />
				
				<button
					type="button"
					onclick={() => uiActions.toggleDragDrop()}
					class="btn-secondary {$isDragDropEnabled ? 'active' : ''}"
					title="Toggle drag-and-drop reordering"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
					{$isDragDropEnabled ? 'Disable' : 'Enable'} Drag
				</button>
				
				<button
					type="button"
					onclick={() => uiActions.openCreateModal()}
					class="btn-primary"
					title="Create new task (Ctrl+N)"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
					</svg>
					New Task
				</button>
			</div>
		</div>

		<div class="stats-container">
			<div class="stat-item">
				<div class="stat-value">{$taskStats.total}</div>
				<div class="stat-label">Total Tasks</div>
			</div>
			<div class="stat-item">
				<div class="stat-value">{$taskStats.pending}</div>
				<div class="stat-label">Pending</div>
			</div>
			<div class="stat-item">
				<div class="stat-value">{$taskStats.inProgress}</div>
				<div class="stat-label">In Progress</div>
			</div>
			<div class="stat-item">
				<div class="stat-value">{$taskStats.completed}</div>
				<div class="stat-label">Completed</div>
			</div>
			<div class="stat-item">
				<div class="stat-value">{$taskStats.completionRate}%</div>
				<div class="stat-label">Complete</div>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		{#if $error}
			<div class="error-banner" role="alert">
				<div class="error-content">
					<svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<span>{$error}</span>
				</div>
				<button
					type="button"
					onclick={handleErrorDismiss}
					class="error-dismiss"
					aria-label="Dismiss error"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
		{/if}

		<FilterBar
			statusFilter={$filterStatus}
			searchQuery={$searchQuery}
			sortField={$sortField}
			sortDirection={$sortDirection}
			taskCount={$filteredTasks.length}
			viewMode={$viewMode}
			on:statusChange={handleStatusFilter}
			on:searchChange={handleSearchChange}
			on:sortChange={handleSortChange}
			on:viewModeChange={handleViewModeChange}
			on:clearFilters={handleClearFilters}
		/>

		<div class="task-list-container">
			{#if $isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p class="loading-text">Loading tasks...</p>
				</div>
			{:else if $filteredTasks.length === 0}
				<div class="empty-state">
					<svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
					</svg>
					<h3 class="empty-title">No tasks found</h3>
					<p class="empty-description">
						{#if $tasks.length === 0}
							Get started by creating your first task.
						{:else}
							Try adjusting your filters or search query.
						{/if}
					</p>
					{#if $tasks.length === 0}
						<button
							type="button"
							onclick={() => uiActions.openCreateModal()}
							class="btn-primary mt-4"
						>
							Create your first task
						</button>
					{/if}
				</div>
			{:else}
				<DragDropList
					items={$filteredTasks}
					viewMode={$viewMode}
					disabled={!$isDragDropEnabled}
					on:reorder={handleTaskReorder}
				>
					{#each $filteredTasks as task (task.id)}
						<div
							in:fly={{ y: 20, duration: $enableAnimations ? 300 : 0, delay: Math.random() * 100 }}
						>
							<TaskCard
								{task}
								viewMode={$viewMode}
								showDragHandle={$isDragDropEnabled}
								on:edit={handleTaskEdit}
								on:delete={handleTaskDelete}
								on:statusChange={handleStatusChange}
							/>
						</div>
					{/each}
				</DragDropList>
			{/if}
		</div>
	</main>

	<Modal
		isOpen={$isCreateModalOpen}
		title="Create New Task"
		on:close={() => uiActions.closeCreateModal()}
	>
		<TaskForm
			on:submit={handleCreateTask}
			on:cancel={() => uiActions.closeCreateModal()}
		/>
	</Modal>

	<Modal
		isOpen={$isEditModalOpen}
		title="Edit Task"
		on:close={() => uiActions.closeEditModal()}
	>
		<TaskForm
			task={$editingTask}
			on:submit={handleEditTask}
			on:cancel={() => uiActions.closeEditModal()}
		/>
	</Modal>

	<ConfirmationDialog
		isOpen={$isDeleteModalOpen}
		title="Delete Task"
		message="Are you sure you want to delete this task? This action cannot be undone."
		confirmText="Delete"
		cancelText="Cancel"
		type="danger"
		on:confirm={handleDeleteTask}
		on:cancel={() => uiActions.closeDeleteModal()}
	/>

	<div class="notifications-container">
		{#each $notifications as notification (notification.id)}
			<NotificationToast
				{notification}
				on:dismiss={(e) => uiActions.removeNotification(e.detail)}
			/>
		{/each}
	</div>
</div>

<style>
	.dashboard-container {
		background-color: rgb(var(--color-bg-primary));
		@apply min-h-screen;
		@apply transition-colors duration-300 ease-in-out;
	}

	.dashboard-header {
		background-color: rgb(var(--color-surface-elevated));
		border-bottom: 1px solid rgb(var(--color-border-primary));
		@apply sticky top-0 z-40;
		@apply backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95;
	}

	.header-content {
		@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
		@apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
	}

	.header-title {
		@apply flex-1;
	}

	.title {
		color: rgb(var(--color-text-primary));
		@apply text-2xl font-bold;
	}

	.subtitle {
		color: rgb(var(--color-text-secondary));
		@apply text-sm mt-1;
	}

	.header-actions {
		@apply flex items-center gap-3;
	}

	.btn-primary {
		@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md;
		@apply text-white bg-primary-600 hover:bg-primary-700;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
		@apply transition-colors duration-200;
	}

	.btn-secondary {
		@apply inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md;
		@apply text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800;
		@apply hover:bg-gray-50 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
		@apply transition-colors duration-200;
	}

	.btn-secondary.active {
		@apply bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300;
		@apply border-primary-300 dark:border-primary-600;
	}

	.stats-container {
		@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6;
		@apply grid grid-cols-2 sm:grid-cols-5 gap-4;
	}

	.stat-item {
		@apply text-center;
	}

	.stat-value {
		color: rgb(var(--color-text-primary));
		@apply text-2xl font-bold;
	}

	.stat-label {
		color: rgb(var(--color-text-secondary));
		@apply text-xs mt-1;
	}

	.dashboard-main {
		@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
		@apply space-y-6;
	}

	.error-banner {
		background-color: rgb(var(--color-error-bg));
		border: 1px solid rgb(var(--color-error) / 0.3);
		@apply rounded-lg p-4 flex items-center justify-between;
		@apply shadow-sm;
	}

	.error-content {
		@apply flex items-center gap-3;
	}

	.error-icon {
		color: rgb(var(--color-error));
		@apply w-5 h-5 flex-shrink-0;
	}

	.error-dismiss {
		color: rgb(var(--color-error));
		@apply p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800;
		@apply focus:outline-none focus:ring-2 focus:ring-red-500;
		@apply transition-all duration-200 ease-in-out;
	}

	.task-list-container {
		@apply min-h-[400px] my-4 mt-6;
	}

	.loading-state {
		@apply flex flex-col items-center justify-center py-12;
	}

	.loading-spinner {
		@apply w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin;
	}

	.loading-text {
		color: rgb(var(--color-text-secondary));
		@apply mt-4;
	}

	.empty-state {
		@apply flex flex-col items-center justify-center py-12 text-center;
	}

	.empty-icon {
		color: rgb(var(--color-text-tertiary));
		@apply w-16 h-16 mb-4;
	}

	.empty-title {
		color: rgb(var(--color-text-primary));
		@apply text-xl font-semibold mb-2;
	}

	.empty-description {
		color: rgb(var(--color-text-secondary));
		@apply max-w-md;
	}


	.notifications-container {
		@apply fixed bottom-4 right-4 z-50 space-y-2;
		@apply max-w-sm w-full;
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
