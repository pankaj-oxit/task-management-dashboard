import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	tasks,
	filteredTasks,
	taskStats,
	filterStatus,
	searchQuery,
	sortField,
	sortDirection,
	isLoading,
	error,
	taskActions
} from './taskStore';
import { TaskAPI } from '../api';
import type { Task, CreateTaskData, UpdateTaskData } from '../types';

// Mock the API
vi.mock('../api', () => ({
	TaskAPI: {
		getTasks: vi.fn(),
		createTask: vi.fn(),
		updateTask: vi.fn(),
		deleteTask: vi.fn(),
		bulkUpdateTasks: vi.fn(),
		bulkDeleteTasks: vi.fn()
	}
}));

const mockTasks: Task[] = [
	{
		id: '1',
		title: 'First Task',
		description: 'First description',
		status: 'pending',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01')
	},
	{
		id: '2',
		title: 'Second Task',
		description: 'Second description',
		status: 'in-progress',
		createdAt: new Date('2024-01-02'),
		updatedAt: new Date('2024-01-02')
	},
	{
		id: '3',
		title: 'Third Task',
		status: 'completed',
		createdAt: new Date('2024-01-03'),
		updatedAt: new Date('2024-01-03')
	}
];

describe('Task Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset stores
		tasks.set([]);
		filterStatus.set('all');
		searchQuery.set('');
		sortField.set('createdAt');
		sortDirection.set('desc');
		isLoading.set(false);
		error.set(null);
	});

	describe('Basic store functionality', () => {
		it('should initialize with empty state', () => {
			expect(get(tasks)).toEqual([]);
			expect(get(filterStatus)).toBe('all');
			expect(get(searchQuery)).toBe('');
			expect(get(isLoading)).toBe(false);
			expect(get(error)).toBe(null);
		});

		it('should update tasks store', () => {
			tasks.set(mockTasks);
			expect(get(tasks)).toEqual(mockTasks);
		});
	});

	describe('filteredTasks derived store', () => {
		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should return all tasks when no filters applied', () => {
			const filtered = get(filteredTasks);
			expect(filtered).toHaveLength(3);
		});

		it('should filter by status', () => {
			filterStatus.set('pending');
			const filtered = get(filteredTasks);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].status).toBe('pending');
		});

		it('should filter by search query', () => {
			searchQuery.set('First');
			const filtered = get(filteredTasks);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('First Task');
		});

		it('should sort tasks by title ascending', () => {
			sortField.set('title');
			sortDirection.set('asc');
			const filtered = get(filteredTasks);
			expect(filtered[0].title).toBe('First Task');
			expect(filtered[1].title).toBe('Second Task');
			expect(filtered[2].title).toBe('Third Task');
		});

		it('should combine filters and sorting', () => {
			filterStatus.set('pending');
			searchQuery.set('First');
			sortField.set('title');
			sortDirection.set('asc');
			
			const filtered = get(filteredTasks);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('First Task');
			expect(filtered[0].status).toBe('pending');
		});
	});

	describe('taskStats derived store', () => {
		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should calculate correct statistics', () => {
			const stats = get(taskStats);
			expect(stats.total).toBe(3);
			expect(stats.pending).toBe(1);
			expect(stats.inProgress).toBe(1);
			expect(stats.completed).toBe(1);
			expect(stats.completionRate).toBe(33); // 1/3 * 100 rounded
		});

		it('should handle empty task list', () => {
			tasks.set([]);
			const stats = get(taskStats);
			expect(stats.total).toBe(0);
			expect(stats.pending).toBe(0);
			expect(stats.inProgress).toBe(0);
			expect(stats.completed).toBe(0);
			expect(stats.completionRate).toBe(0);
		});
	});

	describe('taskActions.loadTasks', () => {
		it('should load tasks successfully', async () => {
			const mockResponse = {
				success: true,
				data: mockTasks,
				message: 'Success'
			};
			vi.mocked(TaskAPI.getTasks).mockResolvedValue(mockResponse);

			await taskActions.loadTasks();

			expect(get(tasks)).toEqual(mockTasks);
			expect(get(isLoading)).toBe(false);
			expect(get(error)).toBe(null);
		});

		it('should handle API error', async () => {
			const mockResponse = {
				success: false,
				data: [],
				message: 'API Error'
			};
			vi.mocked(TaskAPI.getTasks).mockResolvedValue(mockResponse);

			await taskActions.loadTasks();

			expect(get(tasks)).toEqual([]);
			expect(get(error)).toBe('API Error');
			expect(get(isLoading)).toBe(false);
		});

		it('should handle network error', async () => {
			vi.mocked(TaskAPI.getTasks).mockRejectedValue(new Error('Network error'));

			await taskActions.loadTasks();

			expect(get(error)).toBe('Network error while loading tasks');
			expect(get(isLoading)).toBe(false);
		});
	});

	describe('taskActions.createTask', () => {
		const newTaskData: CreateTaskData = {
			title: 'New Task',
			description: 'New description',
			status: 'pending'
		};

		const newTask: Task = {
			id: '4',
			title: 'New Task',
			description: 'New description',
			status: 'pending',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		it('should create task successfully', async () => {
			tasks.set(mockTasks);
			const mockResponse = {
				success: true,
				data: newTask,
				message: 'Created'
			};
			vi.mocked(TaskAPI.createTask).mockResolvedValue(mockResponse);

			const result = await taskActions.createTask(newTaskData);

			expect(result).toEqual(newTask);
			expect(get(tasks)).toHaveLength(4);
			expect(get(tasks)[0]).toEqual(newTask); // Should be at the beginning
			expect(get(error)).toBe(null);
		});

		it('should handle create error', async () => {
			const mockResponse = {
				success: false,
				data: null as any,
				message: 'Create failed'
			};
			vi.mocked(TaskAPI.createTask).mockResolvedValue(mockResponse);

			const result = await taskActions.createTask(newTaskData);

			expect(result).toBe(null);
			expect(get(error)).toBe('Create failed');
		});
	});

	describe('taskActions.updateTask', () => {
		const updateData: UpdateTaskData = {
			title: 'Updated Task',
			status: 'completed'
		};

		const updatedTask: Task = {
			...mockTasks[0],
			title: 'Updated Task',
			status: 'completed',
			updatedAt: new Date()
		};

		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should update task successfully', async () => {
			const mockResponse = {
				success: true,
				data: updatedTask,
				message: 'Updated'
			};
			vi.mocked(TaskAPI.updateTask).mockResolvedValue(mockResponse);

			const result = await taskActions.updateTask('1', updateData);

			expect(result).toEqual(updatedTask);
			const currentTasks = get(tasks);
			expect(currentTasks[0]).toEqual(updatedTask);
			expect(get(error)).toBe(null);
		});

		it('should handle update error', async () => {
			const mockResponse = {
				success: false,
				data: null as any,
				message: 'Update failed'
			};
			vi.mocked(TaskAPI.updateTask).mockResolvedValue(mockResponse);

			const result = await taskActions.updateTask('1', updateData);

			expect(result).toBe(null);
			expect(get(error)).toBe('Update failed');
		});
	});

	describe('taskActions.deleteTask', () => {
		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should delete task successfully', async () => {
			const mockResponse = {
				success: true,
				message: 'Deleted'
			};
			vi.mocked(TaskAPI.deleteTask).mockResolvedValue(mockResponse);

			const result = await taskActions.deleteTask('1');

			expect(result).toBe(true);
			expect(get(tasks)).toHaveLength(2);
			expect(get(tasks).find(t => t.id === '1')).toBeUndefined();
			expect(get(error)).toBe(null);
		});

		it('should handle delete error', async () => {
			const mockResponse = {
				success: false,
				message: 'Delete failed'
			};
			vi.mocked(TaskAPI.deleteTask).mockResolvedValue(mockResponse);

			const result = await taskActions.deleteTask('1');

			expect(result).toBe(false);
			expect(get(error)).toBe('Delete failed');
			expect(get(tasks)).toHaveLength(3); // Should remain unchanged
		});
	});

	describe('taskActions.bulkUpdateTasks', () => {
		const updates = [
			{ id: '1', data: { status: 'completed' as const } },
			{ id: '2', data: { status: 'completed' as const } }
		];

		const updatedTasks = [
			{ ...mockTasks[0], status: 'completed' as const },
			{ ...mockTasks[1], status: 'completed' as const }
		];

		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should bulk update tasks successfully', async () => {
			const mockResponse = {
				success: true,
				data: updatedTasks,
				message: 'Updated'
			};
			vi.mocked(TaskAPI.bulkUpdateTasks).mockResolvedValue(mockResponse);

			const result = await taskActions.bulkUpdateTasks(updates);

			expect(result).toEqual(updatedTasks);
			const currentTasks = get(tasks);
			expect(currentTasks[0].status).toBe('completed');
			expect(currentTasks[1].status).toBe('completed');
			expect(get(error)).toBe(null);
		});

		it('should handle bulk update error', async () => {
			const mockResponse = {
				success: false,
				data: null as any,
				message: 'Bulk update failed'
			};
			vi.mocked(TaskAPI.bulkUpdateTasks).mockResolvedValue(mockResponse);

			const result = await taskActions.bulkUpdateTasks(updates);

			expect(result).toBe(null);
			expect(get(error)).toBe('Bulk update failed');
		});
	});

	describe('taskActions.bulkDeleteTasks', () => {
		const idsToDelete = ['1', '2'];

		beforeEach(() => {
			tasks.set(mockTasks);
		});

		it('should bulk delete tasks successfully', async () => {
			const mockResponse = {
				success: true,
				message: 'Deleted',
				deletedCount: 2
			};
			vi.mocked(TaskAPI.bulkDeleteTasks).mockResolvedValue(mockResponse);

			const result = await taskActions.bulkDeleteTasks(idsToDelete);

			expect(result).toBe(2);
			expect(get(tasks)).toHaveLength(1);
			expect(get(tasks)[0].id).toBe('3');
			expect(get(error)).toBe(null);
		});

		it('should handle bulk delete error', async () => {
			const mockResponse = {
				success: false,
				message: 'Bulk delete failed',
				deletedCount: 0
			};
			vi.mocked(TaskAPI.bulkDeleteTasks).mockResolvedValue(mockResponse);

			const result = await taskActions.bulkDeleteTasks(idsToDelete);

			expect(result).toBe(0);
			expect(get(error)).toBe('Bulk delete failed');
			expect(get(tasks)).toHaveLength(3); // Should remain unchanged
		});
	});

	describe('taskActions utility methods', () => {
		it('should clear error', () => {
			error.set('Some error');
			taskActions.clearError();
			expect(get(error)).toBe(null);
		});

		it('should reset filters', () => {
			filterStatus.set('pending');
			searchQuery.set('test');
			sortField.set('title');
			sortDirection.set('asc');

			taskActions.resetFilters();

			expect(get(filterStatus)).toBe('all');
			expect(get(searchQuery)).toBe('');
			expect(get(sortField)).toBe('createdAt');
			expect(get(sortDirection)).toBe('desc');
		});

		it('should handle search with empty query', () => {
			searchQuery.set('test');
			taskActions.searchTasks('');
			expect(get(searchQuery)).toBe('');
		});

		it('should handle search with query', () => {
			taskActions.searchTasks('test query');
			expect(get(searchQuery)).toBe('test query');
		});
	});
});
