import { writable, derived } from 'svelte/store';
import type { Task, CreateTaskData, UpdateTaskData, SortField, SortDirection } from '../types';
import { TaskAPI } from '../api';
import { filterTasks, sortTasks } from '../utils';

// Task data store
export const tasks = writable<Task[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);

// Filter and sort stores
export const filterStatus = writable<'all' | Task['status']>('all');
export const searchQuery = writable<string>('');
export const sortField = writable<SortField>('createdAt');
export const sortDirection = writable<SortDirection>('desc');

// Derived store for filtered and sorted tasks
export const filteredTasks = derived(
	[tasks, filterStatus, searchQuery, sortField, sortDirection],
	([$tasks, $filterStatus, $searchQuery, $sortField, $sortDirection]) => {
		const filtered = filterTasks($tasks, $filterStatus, $searchQuery);
		return sortTasks(filtered, $sortField, $sortDirection);
	}
);

// Task statistics
export const taskStats = derived(tasks, ($tasks) => {
	const total = $tasks.length;
	const pending = $tasks.filter(task => task.status === 'pending').length;
	const inProgress = $tasks.filter(task => task.status === 'in-progress').length;
	const completed = $tasks.filter(task => task.status === 'completed').length;
	
	return {
		total,
		pending,
		inProgress,
		completed,
		completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
	};
});

// Task actions
export const taskActions = {
	// Load all tasks
	async loadTasks() {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.getTasks();
			if (response.success) {
				tasks.set(response.data);
			} else {
				error.set(response.message || 'Failed to load tasks');
			}
		} catch (err) {
			error.set('Network error while loading tasks');
			console.error('Error loading tasks:', err);
		} finally {
			isLoading.set(false);
		}
	},

	// Create new task
	async createTask(taskData: CreateTaskData) {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.createTask(taskData);
			if (response.success) {
				tasks.update($tasks => [response.data, ...$tasks]);
				return response.data;
			} else {
				error.set(response.message || 'Failed to create task');
				return null;
			}
		} catch (err) {
			error.set('Network error while creating task');
			console.error('Error creating task:', err);
			return null;
		} finally {
			isLoading.set(false);
		}
	},

	// Update existing task
	async updateTask(id: string, updateData: UpdateTaskData) {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.updateTask(id, updateData);
			if (response.success) {
				tasks.update($tasks => 
					$tasks.map(task => task.id === id ? response.data : task)
				);
				return response.data;
			} else {
				error.set(response.message || 'Failed to update task');
				return null;
			}
		} catch (err) {
			error.set('Network error while updating task');
			console.error('Error updating task:', err);
			return null;
		} finally {
			isLoading.set(false);
		}
	},

	// Delete task
	async deleteTask(id: string) {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.deleteTask(id);
			if (response.success) {
				tasks.update($tasks => $tasks.filter(task => task.id !== id));
				return true;
			} else {
				error.set(response.message || 'Failed to delete task');
				return false;
			}
		} catch (err) {
			error.set('Network error while deleting task');
			console.error('Error deleting task:', err);
			return false;
		} finally {
			isLoading.set(false);
		}
	},

	// Bulk operations
	async bulkUpdateTasks(updates: { id: string; data: UpdateTaskData }[]) {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.bulkUpdateTasks(updates);
			if (response.success) {
				tasks.update($tasks => 
					$tasks.map(task => {
						const update = response.data.find(updated => updated.id === task.id);
						return update || task;
					})
				);
				return response.data;
			} else {
				error.set(response.message || 'Failed to update tasks');
				return null;
			}
		} catch (err) {
			error.set('Network error while updating tasks');
			console.error('Error updating tasks:', err);
			return null;
		} finally {
			isLoading.set(false);
		}
	},

	async bulkDeleteTasks(ids: string[]) {
		isLoading.set(true);
		error.set(null);
		
		try {
			const response = await TaskAPI.bulkDeleteTasks(ids);
			if (response.success) {
				tasks.update($tasks => $tasks.filter(task => !ids.includes(task.id)));
				return response.deletedCount;
			} else {
				error.set(response.message || 'Failed to delete tasks');
				return 0;
			}
		} catch (err) {
			error.set('Network error while deleting tasks');
			console.error('Error deleting tasks:', err);
			return 0;
		} finally {
			isLoading.set(false);
		}
	},

	// Search tasks
	async searchTasks(query: string) {
		if (!query.trim()) {
			searchQuery.set('');
			return;
		}

		searchQuery.set(query);
		// The derived store will handle the filtering automatically
	},

	// Reorder tasks (for drag-and-drop)
	reorderTasks(reorderedTasks: Task[]) {
		tasks.set(reorderedTasks);
		// In a real app, you might want to save this order to the backend
		// For now, we'll just update the local state
	},

	// Clear error
	clearError() {
		error.set(null);
	},

	// Reset filters
	resetFilters() {
		filterStatus.set('all');
		searchQuery.set('');
		sortField.set('createdAt');
		sortDirection.set('desc');
	},
};
