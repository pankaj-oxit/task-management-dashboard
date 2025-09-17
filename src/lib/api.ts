import type { Task, CreateTaskData, UpdateTaskData, TasksResponse, TaskResponse } from './types';
import { mockTasks } from './mockData';
import { generateId } from './utils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let tasks: Task[] = [...mockTasks];

export class TaskAPI {
	static async getTasks(): Promise<TasksResponse> {
		await delay(500);
		
		return {
			data: [...tasks],
			success: true,
			message: 'Tasks retrieved successfully',
		};
	}

	static async getTask(id: string): Promise<TaskResponse> {
		await delay(300);
		
		const task = tasks.find(t => t.id === id);
		if (!task) {
			return {
				data: null as any,
				success: false,
				message: 'Task not found',
			};
		}

		return {
			data: task,
			success: true,
			message: 'Task retrieved successfully',
		};
	}

	static async createTask(taskData: CreateTaskData): Promise<TaskResponse> {
		await delay(800);
		
		const newTask: Task = {
			id: generateId(),
			title: taskData.title,
			description: taskData.description,
			status: taskData.status,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		tasks.unshift(newTask);

		return {
			data: newTask,
			success: true,
			message: 'Task created successfully',
		};
	}

	// Update existing task
	static async updateTask(id: string, updateData: UpdateTaskData): Promise<TaskResponse> {
		await delay(600);
		
		const taskIndex = tasks.findIndex(t => t.id === id);
		if (taskIndex === -1) {
			return {
				data: null as any,
				success: false,
				message: 'Task not found',
			};
		}

		const updatedTask: Task = {
			...tasks[taskIndex],
			...updateData,
			updatedAt: new Date(),
		};

		tasks[taskIndex] = updatedTask;

		return {
			data: updatedTask,
			success: true,
			message: 'Task updated successfully',
		};
	}

	// Delete task
	static async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
		await delay(400);
		
		const taskIndex = tasks.findIndex(t => t.id === id);
		if (taskIndex === -1) {
			return {
				success: false,
				message: 'Task not found',
			};
		}

		tasks.splice(taskIndex, 1);

		return {
			success: true,
			message: 'Task deleted successfully',
		};
	}

	// Bulk operations
	static async bulkUpdateTasks(updates: { id: string; data: UpdateTaskData }[]): Promise<TasksResponse> {
		await delay(1000);
		
		const updatedTasks: Task[] = [];
		
		for (const update of updates) {
			const taskIndex = tasks.findIndex(t => t.id === update.id);
			if (taskIndex !== -1) {
				const updatedTask: Task = {
					...tasks[taskIndex],
					...update.data,
					updatedAt: new Date(),
				};
				tasks[taskIndex] = updatedTask;
				updatedTasks.push(updatedTask);
			}
		}

		return {
			data: updatedTasks,
			success: true,
			message: `${updatedTasks.length} tasks updated successfully`,
		};
	}

	static async bulkDeleteTasks(ids: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
		await delay(800);
		
		let deletedCount = 0;
		
		for (const id of ids) {
			const taskIndex = tasks.findIndex(t => t.id === id);
			if (taskIndex !== -1) {
				tasks.splice(taskIndex, 1);
				deletedCount++;
			}
		}

		return {
			success: true,
			message: `${deletedCount} tasks deleted successfully`,
			deletedCount,
		};
	}

	// Search tasks
	static async searchTasks(query: string): Promise<TasksResponse> {
		await delay(300);
		
		const searchResults = tasks.filter(task => 
			task.title.toLowerCase().includes(query.toLowerCase()) ||
			(task.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
		);

		return {
			data: searchResults,
			success: true,
			message: `Found ${searchResults.length} tasks matching "${query}"`,
		};
	}

	// Reset to initial state (for testing)
	static resetData(): void {
		tasks = [...mockTasks];
	}
}
