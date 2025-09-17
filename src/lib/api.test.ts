import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskAPI } from './api';
import type { CreateTaskData, UpdateTaskData } from './types';

// Mock setTimeout to speed up tests
vi.mock('timers', () => ({
	setTimeout: vi.fn((fn) => fn())
}));

describe('TaskAPI', () => {
	beforeEach(() => {
		TaskAPI.resetData();
		vi.clearAllTimers();
	});

	describe('getTasks', () => {
		it('should return all tasks', async () => {
			const response = await TaskAPI.getTasks();
			
			expect(response.success).toBe(true);
			expect(response.data).toBeDefined();
			expect(Array.isArray(response.data)).toBe(true);
			expect(response.data.length).toBeGreaterThan(0);
			expect(response.message).toBe('Tasks retrieved successfully');
		});

		it('should return tasks with correct structure', async () => {
			const response = await TaskAPI.getTasks();
			const firstTask = response.data[0];
			
			expect(firstTask).toHaveProperty('id');
			expect(firstTask).toHaveProperty('title');
			expect(firstTask).toHaveProperty('status');
			expect(firstTask).toHaveProperty('createdAt');
			expect(firstTask).toHaveProperty('updatedAt');
			expect(['pending', 'in-progress', 'completed']).toContain(firstTask.status);
		});
	});

	describe('getTask', () => {
		it('should return specific task by ID', async () => {
			const allTasks = await TaskAPI.getTasks();
			const firstTaskId = allTasks.data[0].id;
			
			const response = await TaskAPI.getTask(firstTaskId);
			
			expect(response.success).toBe(true);
			expect(response.data.id).toBe(firstTaskId);
			expect(response.message).toBe('Task retrieved successfully');
		});

		it('should return error for non-existent task', async () => {
			const response = await TaskAPI.getTask('non-existent-id');
			
			expect(response.success).toBe(false);
			expect(response.message).toBe('Task not found');
		});
	});

	describe('createTask', () => {
		const newTaskData: CreateTaskData = {
			title: 'New Test Task',
			description: 'Test description',
			status: 'pending'
		};

		it('should create a new task', async () => {
			const response = await TaskAPI.createTask(newTaskData);
			
			expect(response.success).toBe(true);
			expect(response.data.title).toBe(newTaskData.title);
			expect(response.data.description).toBe(newTaskData.description);
			expect(response.data.status).toBe(newTaskData.status);
			expect(response.data.id).toBeDefined();
			expect(response.data.createdAt).toBeInstanceOf(Date);
			expect(response.data.updatedAt).toBeInstanceOf(Date);
			expect(response.message).toBe('Task created successfully');
		});

		it('should add task to the beginning of the list', async () => {
			const initialTasks = await TaskAPI.getTasks();
			const initialCount = initialTasks.data.length;
			
			const response = await TaskAPI.createTask(newTaskData);
			
			const updatedTasks = await TaskAPI.getTasks();
			expect(updatedTasks.data.length).toBe(initialCount + 1);
			expect(updatedTasks.data[0].id).toBe(response.data.id);
		});
	});

	describe('updateTask', () => {
		const updateData: UpdateTaskData = {
			title: 'Updated Task Title',
			status: 'completed'
		};

		it('should update existing task', async () => {
			const allTasks = await TaskAPI.getTasks();
			const taskToUpdate = allTasks.data[0];
			
			const response = await TaskAPI.updateTask(taskToUpdate.id, updateData);
			
			expect(response.success).toBe(true);
			expect(response.data.id).toBe(taskToUpdate.id);
			expect(response.data.title).toBe(updateData.title);
			expect(response.data.status).toBe(updateData.status);
			expect(response.data.updatedAt).not.toEqual(taskToUpdate.updatedAt);
			expect(response.message).toBe('Task updated successfully');
		});

		it('should return error for non-existent task', async () => {
			const response = await TaskAPI.updateTask('non-existent-id', updateData);
			
			expect(response.success).toBe(false);
			expect(response.message).toBe('Task not found');
		});

		it('should preserve unchanged fields', async () => {
			const allTasks = await TaskAPI.getTasks();
			const taskToUpdate = allTasks.data[0];
			const originalDescription = taskToUpdate.description;
			
			const response = await TaskAPI.updateTask(taskToUpdate.id, { title: 'New Title' });
			
			expect(response.data.description).toBe(originalDescription);
			expect(response.data.title).toBe('New Title');
		});
	});

	describe('deleteTask', () => {
		it('should delete existing task', async () => {
			const allTasks = await TaskAPI.getTasks();
			const taskToDelete = allTasks.data[0];
			const initialCount = allTasks.data.length;
			
			const response = await TaskAPI.deleteTask(taskToDelete.id);
			
			expect(response.success).toBe(true);
			expect(response.message).toBe('Task deleted successfully');
			
			const updatedTasks = await TaskAPI.getTasks();
			expect(updatedTasks.data.length).toBe(initialCount - 1);
			expect(updatedTasks.data.find(t => t.id === taskToDelete.id)).toBeUndefined();
		});

		it('should return error for non-existent task', async () => {
			const response = await TaskAPI.deleteTask('non-existent-id');
			
			expect(response.success).toBe(false);
			expect(response.message).toBe('Task not found');
		});
	});

	describe('bulkUpdateTasks', () => {
		it('should update multiple tasks', async () => {
			const allTasks = await TaskAPI.getTasks();
			const tasksToUpdate = allTasks.data.slice(0, 2);
			
			const updates = tasksToUpdate.map(task => ({
				id: task.id,
				data: { status: 'completed' as const }
			}));
			
			const response = await TaskAPI.bulkUpdateTasks(updates);
			
			expect(response.success).toBe(true);
			expect(response.data.length).toBe(2);
			expect(response.data.every(task => task.status === 'completed')).toBe(true);
			expect(response.message).toBe('2 tasks updated successfully');
		});

		it('should handle partial updates', async () => {
			const allTasks = await TaskAPI.getTasks();
			const validTask = allTasks.data[0];
			
			const updates = [
				{ id: validTask.id, data: { status: 'completed' as const } },
				{ id: 'non-existent-id', data: { status: 'completed' as const } }
			];
			
			const response = await TaskAPI.bulkUpdateTasks(updates);
			
			expect(response.success).toBe(true);
			expect(response.data.length).toBe(1);
			expect(response.message).toBe('1 tasks updated successfully');
		});
	});

	describe('bulkDeleteTasks', () => {
		it('should delete multiple tasks', async () => {
			const allTasks = await TaskAPI.getTasks();
			const tasksToDelete = allTasks.data.slice(0, 2);
			const idsToDelete = tasksToDelete.map(task => task.id);
			const initialCount = allTasks.data.length;
			
			const response = await TaskAPI.bulkDeleteTasks(idsToDelete);
			
			expect(response.success).toBe(true);
			expect(response.deletedCount).toBe(2);
			expect(response.message).toBe('2 tasks deleted successfully');
			
			const updatedTasks = await TaskAPI.getTasks();
			expect(updatedTasks.data.length).toBe(initialCount - 2);
		});

		it('should handle partial deletes', async () => {
			const allTasks = await TaskAPI.getTasks();
			const validTask = allTasks.data[0];
			const idsToDelete = [validTask.id, 'non-existent-id'];
			
			const response = await TaskAPI.bulkDeleteTasks(idsToDelete);
			
			expect(response.success).toBe(true);
			expect(response.deletedCount).toBe(1);
			expect(response.message).toBe('1 tasks deleted successfully');
		});
	});

	describe('searchTasks', () => {
		it('should search tasks by title', async () => {
			const allTasks = await TaskAPI.getTasks();
			const firstTask = allTasks.data[0];
			const searchTerm = firstTask.title.split(' ')[0]; // First word of title
			
			const response = await TaskAPI.searchTasks(searchTerm);
			
			expect(response.success).toBe(true);
			expect(response.data.length).toBeGreaterThan(0);
			expect(response.data.some(task => 
				task.title.toLowerCase().includes(searchTerm.toLowerCase())
			)).toBe(true);
		});

		it('should search tasks by description', async () => {
			const allTasks = await TaskAPI.getTasks();
			const taskWithDescription = allTasks.data.find(task => task.description);
			
			if (taskWithDescription && taskWithDescription.description) {
				const searchTerm = taskWithDescription.description.split(' ')[0];
				const response = await TaskAPI.searchTasks(searchTerm);
				
				expect(response.success).toBe(true);
				expect(response.data.some(task => 
					task.description?.toLowerCase().includes(searchTerm.toLowerCase())
				)).toBe(true);
			}
		});

		it('should return empty results for non-matching search', async () => {
			const response = await TaskAPI.searchTasks('xyznomatch123');
			
			expect(response.success).toBe(true);
			expect(response.data.length).toBe(0);
			expect(response.message).toBe('Found 0 tasks matching "xyznomatch123"');
		});

		it('should be case insensitive', async () => {
			const allTasks = await TaskAPI.getTasks();
			const firstTask = allTasks.data[0];
			const searchTerm = firstTask.title.split(' ')[0].toUpperCase();
			
			const response = await TaskAPI.searchTasks(searchTerm);
			
			expect(response.success).toBe(true);
			expect(response.data.length).toBeGreaterThan(0);
		});
	});

	describe('resetData', () => {
		it('should reset tasks to initial state', async () => {
			// Create a new task
			await TaskAPI.createTask({
				title: 'Temporary Task',
				status: 'pending'
			});
			
			let tasks = await TaskAPI.getTasks();
			const countAfterCreate = tasks.data.length;
			
			// Reset data
			TaskAPI.resetData();
			
			tasks = await TaskAPI.getTasks();
			expect(tasks.data.length).toBeLessThan(countAfterCreate);
		});
	});
});
