import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Task, Theme } from '../types';
import { getSystemTheme, applyTheme, loadFromLocalStorage, saveToLocalStorage } from '../utils';

// Modal state
export const isCreateModalOpen = writable<boolean>(false);
export const isEditModalOpen = writable<boolean>(false);
export const isDeleteModalOpen = writable<boolean>(false);
export const editingTask = writable<Task | null>(null);
export const deletingTask = writable<Task | null>(null);

// Theme management
export const theme = writable<Theme>(
	browser ? loadFromLocalStorage('theme', 'system') : 'system'
);

// Derived store for actual theme (resolves 'system' to 'light' or 'dark')
export const actualTheme = derived(theme, ($theme) => {
	if ($theme === 'system') {
		return browser ? getSystemTheme() : 'light';
	}
	return $theme;
});

// Apply theme when it changes
if (browser) {
	actualTheme.subscribe((theme) => {
		applyTheme(theme);
	});

	// Save theme preference
	theme.subscribe((theme) => {
		saveToLocalStorage('theme', theme);
	});

	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		// Trigger reactivity for system theme
		theme.update(t => t);
	});
}

// UI preferences
export const sidebarCollapsed = writable<boolean>(
	browser ? loadFromLocalStorage('sidebarCollapsed', false) : false
);

export const viewMode = writable<'grid' | 'list'>(
	browser ? loadFromLocalStorage('viewMode', 'grid') : 'grid'
);

export const enableAnimations = writable<boolean>(
	browser ? loadFromLocalStorage('enableAnimations', true) : true
);

export const itemsPerPage = writable<number>(
	browser ? loadFromLocalStorage('itemsPerPage', 12) : 12
);

export const isDragDropEnabled = writable<boolean>(
	browser ? loadFromLocalStorage('isDragDropEnabled', true) : true
);

// Save UI preferences to localStorage
if (browser) {
	sidebarCollapsed.subscribe((value) => {
		saveToLocalStorage('sidebarCollapsed', value);
	});

	viewMode.subscribe((value) => {
		saveToLocalStorage('viewMode', value);
	});

	enableAnimations.subscribe((value) => {
		saveToLocalStorage('enableAnimations', value);
	});

	itemsPerPage.subscribe((value) => {
		saveToLocalStorage('itemsPerPage', value);
	});

	isDragDropEnabled.subscribe((value) => {
		saveToLocalStorage('isDragDropEnabled', value);
	});
}

// Notification system
export interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		handler: () => void;
	};
}

export const notifications = writable<Notification[]>([]);

// Selection state (for bulk operations)
export const selectedTaskIds = writable<Set<string>>(new Set());
export const isSelectMode = writable<boolean>(false);

// Loading states for different operations
export const loadingStates = writable<{
	creating: boolean;
	updating: boolean;
	deleting: boolean;
	bulkOperations: boolean;
}>({
	creating: false,
	updating: false,
	deleting: false,
	bulkOperations: false,
});

// UI actions
export const uiActions = {
	// Modal management
	openCreateModal() {
		isCreateModalOpen.set(true);
	},

	closeCreateModal() {
		isCreateModalOpen.set(false);
	},

	openEditModal(task: Task) {
		editingTask.set(task);
		isEditModalOpen.set(true);
	},

	closeEditModal() {
		editingTask.set(null);
		isEditModalOpen.set(false);
	},

	openDeleteModal(task: Task) {
		deletingTask.set(task);
		isDeleteModalOpen.set(true);
	},

	closeDeleteModal() {
		deletingTask.set(null);
		isDeleteModalOpen.set(false);
	},

	closeAllModals() {
		isCreateModalOpen.set(false);
		isEditModalOpen.set(false);
		isDeleteModalOpen.set(false);
		editingTask.set(null);
		deletingTask.set(null);
	},

	// Theme management
	setTheme(newTheme: Theme) {
		theme.set(newTheme);
	},

	toggleTheme() {
		theme.update(current => {
			if (current === 'light') return 'dark';
			if (current === 'dark') return 'system';
			return 'light';
		});
	},

	// View management
	toggleSidebar() {
		sidebarCollapsed.update(collapsed => !collapsed);
	},

	setViewMode(mode: 'grid' | 'list') {
		viewMode.set(mode);
	},

	toggleViewMode() {
		viewMode.update(current => current === 'grid' ? 'list' : 'grid');
	},

	// Drag-and-drop management
	toggleDragDrop() {
		isDragDropEnabled.update(enabled => !enabled);
	},

	setDragDropEnabled(enabled: boolean) {
		isDragDropEnabled.set(enabled);
	},

	// Selection management
	toggleSelectMode() {
		isSelectMode.update(mode => !mode);
		if (!isSelectMode) {
			selectedTaskIds.set(new Set());
		}
	},

	selectTask(taskId: string) {
		selectedTaskIds.update(selected => {
			const newSelected = new Set(selected);
			if (newSelected.has(taskId)) {
				newSelected.delete(taskId);
			} else {
				newSelected.add(taskId);
			}
			return newSelected;
		});
	},

	selectAllTasks(taskIds: string[]) {
		selectedTaskIds.set(new Set(taskIds));
	},

	clearSelection() {
		selectedTaskIds.set(new Set());
	},

	// Notification management
	addNotification(notification: Omit<Notification, 'id'>) {
		const id = Date.now().toString();
		const newNotification: Notification = {
			...notification,
			id,
			duration: notification.duration ?? 5000,
		};

		notifications.update(current => [...current, newNotification]);

		// Auto-remove notification after duration
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				uiActions.removeNotification(id);
			}, newNotification.duration);
		}

		return id;
	},

	removeNotification(id: string) {
		notifications.update(current => current.filter(n => n.id !== id));
	},

	clearAllNotifications() {
		notifications.set([]);
	},

	// Loading states
	setLoadingState(operation: keyof typeof loadingStates, loading: boolean) {
		loadingStates.update(current => ({
			...current,
			[operation]: loading,
		}));
	},
};
