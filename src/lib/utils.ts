import type { Task, TaskStatus, SortField, SortDirection } from './types';

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date);
}

export function formatDateTime(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

export function getRelativeTime(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return 'Just now';
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
	
	return formatDate(date);
}

export function getStatusColor(status: TaskStatus): string {
	switch (status) {
		case 'pending':
			return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
		case 'in-progress':
			return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
		case 'completed':
			return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
		default:
			return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
	}
}

export function getStatusIcon(status: TaskStatus): string {
	switch (status) {
		case 'pending':
			return '⏳';
		case 'in-progress':
			return '🔄';
		case 'completed':
			return '✅';
		default:
			return '❓';
	}
}

export function filterTasks(
	tasks: Task[],
	statusFilter: TaskStatus | 'all',
	searchQuery: string,
): Task[] {
	return tasks.filter((task) => {
		const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
		const matchesSearch =
			searchQuery === '' ||
			task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

		return matchesStatus && matchesSearch;
	});
}

export function sortTasks(
	tasks: Task[],
	field: SortField,
	direction: SortDirection,
): Task[] {
	return [...tasks].sort((a, b) => {
		let aValue: string | number | Date;
		let bValue: string | number | Date;

		switch (field) {
			case 'title':
				aValue = a.title.toLowerCase();
				bValue = b.title.toLowerCase();
				break;
			case 'createdAt':
				aValue = a.createdAt;
				bValue = b.createdAt;
				break;
			case 'updatedAt':
				aValue = a.updatedAt;
				bValue = b.updatedAt;
				break;
			case 'status':
				const statusOrder = { pending: 0, 'in-progress': 1, completed: 2 };
				aValue = statusOrder[a.status];
				bValue = statusOrder[b.status];
				break;
			default:
				return 0;
		}

		if (aValue < bValue) return direction === 'asc' ? -1 : 1;
		if (aValue > bValue) return direction === 'asc' ? 1 : -1;
		return 0;
	});
}

export function validateTaskTitle(title: string): string | null {
	if (!title.trim()) return 'Title is required';
	if (title.trim().length < 3) return 'Title must be at least 3 characters';
	if (title.trim().length > 100) return 'Title must be less than 100 characters';
	return null;
}

export function validateTaskDescription(description: string): string | null {
	if (description && description.length > 500) {
		return 'Description must be less than 500 characters';
	}
	return null;
}

export function saveToLocalStorage(key: string, data: any): void {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error('Failed to save to localStorage:', error);
	}
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch (error) {
		console.error('Failed to load from localStorage:', error);
		return defaultValue;
	}
}

export function getSystemTheme(): 'light' | 'dark' {
	if (typeof window !== 'undefined') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

export function applyTheme(theme: 'light' | 'dark'): void {
	if (typeof document !== 'undefined') {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

export function createSlideTransition(node: Element, { delay = 0, duration = 300 }) {
	return {
		delay,
		duration,
		css: (t: number) => `
			transform: translateY(${(1 - t) * 20}px);
			opacity: ${t};
		`,
	};
}

export function createScaleTransition(node: Element, { delay = 0, duration = 200 }) {
	return {
		delay,
		duration,
		css: (t: number) => `
			transform: scale(${0.95 + t * 0.05});
			opacity: ${t};
		`,
	};
}
