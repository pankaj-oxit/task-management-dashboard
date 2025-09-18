import type { Task } from './types';
import { generateId } from './utils';

export const mockTasks: Task[] = [
	{
		id: generateId(),
		title: 'Set up project structure',
		description: 'Create the basic folder structure and initialize the SvelteKit project with TypeScript',
		status: 'completed',
		createdAt: new Date('2024-01-15T09:00:00'),
		updatedAt: new Date('2024-01-15T11:30:00'),
	},
	{
		id: generateId(),
		title: 'Design task card component',
		description: 'Create a reusable task card component with proper styling and interactions',
		status: 'completed',
		createdAt: new Date('2024-01-15T10:00:00'),
		updatedAt: new Date('2024-01-16T14:20:00'),
	},
	{
		id: generateId(),
		title: 'Implement task filtering',
		description: 'Add functionality to filter tasks by status and search by title/description',
		status: 'in-progress',
		createdAt: new Date('2024-01-16T09:15:00'),
		updatedAt: new Date('2024-01-17T10:45:00'),
	},
	{
		id: generateId(),
		title: 'Add drag and drop functionality',
		description: 'Implement drag and drop to reorder tasks and change their status',
		status: 'pending',
		createdAt: new Date('2024-01-16T14:30:00'),
		updatedAt: new Date('2024-01-16T14:30:00'),
	},
	{
		id: generateId(),
		title: 'Write comprehensive tests',
		description: 'Add unit tests for all components and stores with at least 80% coverage',
		status: 'pending',
		createdAt: new Date('2024-01-17T08:00:00'),
		updatedAt: new Date('2024-01-17T08:00:00'),
	},
	{
		id: generateId(),
		title: 'Implement dark mode toggle',
		description: 'Add a toggle to switch between light and dark themes',
		status: 'in-progress',
		createdAt: new Date('2024-01-17T11:00:00'),
		updatedAt: new Date('2024-01-17T15:30:00'),
	},
	{
		id: generateId(),
		title: 'Optimize performance',
		description: 'Review and optimize component rendering and state updates for better performance',
		status: 'pending',
		createdAt: new Date('2024-01-17T16:00:00'),
		updatedAt: new Date('2024-01-17T16:00:00'),
	},
	{
		id: generateId(),
		title: 'Add accessibility features',
		description: 'Ensure all components are accessible with proper ARIA attributes and keyboard navigation',
		status: 'pending',
		createdAt: new Date('2024-01-18T09:30:00'),
		updatedAt: new Date('2024-01-18T09:30:00'),
	},
];
