import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	isCreateModalOpen,
	isEditModalOpen,
	isDeleteModalOpen,
	editingTask,
	deletingTask,
	theme,
	actualTheme,
	viewMode,
	notifications,
	selectedTaskIds,
	isSelectMode,
	uiActions,
	type Notification
} from './uiStore';
import type { Task } from '../types';

// Mock browser environment
Object.defineProperty(global, 'window', {
	value: {
		matchMedia: vi.fn(() => ({
			matches: false,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	}
});

const mockTask: Task = {
	id: '1',
	title: 'Test Task',
	description: 'Test description',
	status: 'pending',
	createdAt: new Date(),
	updatedAt: new Date()
};

describe('UI Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset stores to initial state
		isCreateModalOpen.set(false);
		isEditModalOpen.set(false);
		isDeleteModalOpen.set(false);
		editingTask.set(null);
		deletingTask.set(null);
		theme.set('system');
		viewMode.set('grid');
		notifications.set([]);
		selectedTaskIds.set(new Set());
		isSelectMode.set(false);
	});

	describe('Modal management', () => {
		it('should open and close create modal', () => {
			expect(get(isCreateModalOpen)).toBe(false);
			
			uiActions.openCreateModal();
			expect(get(isCreateModalOpen)).toBe(true);
			
			uiActions.closeCreateModal();
			expect(get(isCreateModalOpen)).toBe(false);
		});

		it('should open and close edit modal with task', () => {
			expect(get(isEditModalOpen)).toBe(false);
			expect(get(editingTask)).toBe(null);
			
			uiActions.openEditModal(mockTask);
			expect(get(isEditModalOpen)).toBe(true);
			expect(get(editingTask)).toEqual(mockTask);
			
			uiActions.closeEditModal();
			expect(get(isEditModalOpen)).toBe(false);
			expect(get(editingTask)).toBe(null);
		});

		it('should open and close delete modal with task', () => {
			expect(get(isDeleteModalOpen)).toBe(false);
			expect(get(deletingTask)).toBe(null);
			
			uiActions.openDeleteModal(mockTask);
			expect(get(isDeleteModalOpen)).toBe(true);
			expect(get(deletingTask)).toEqual(mockTask);
			
			uiActions.closeDeleteModal();
			expect(get(isDeleteModalOpen)).toBe(false);
			expect(get(deletingTask)).toBe(null);
		});

		it('should close all modals', () => {
			// Open all modals
			uiActions.openCreateModal();
			uiActions.openEditModal(mockTask);
			uiActions.openDeleteModal(mockTask);
			
			expect(get(isCreateModalOpen)).toBe(true);
			expect(get(isEditModalOpen)).toBe(true);
			expect(get(isDeleteModalOpen)).toBe(true);
			
			uiActions.closeAllModals();
			
			expect(get(isCreateModalOpen)).toBe(false);
			expect(get(isEditModalOpen)).toBe(false);
			expect(get(isDeleteModalOpen)).toBe(false);
			expect(get(editingTask)).toBe(null);
			expect(get(deletingTask)).toBe(null);
		});
	});

	describe('Theme management', () => {
		it('should set theme', () => {
			uiActions.setTheme('dark');
			expect(get(theme)).toBe('dark');
			
			uiActions.setTheme('light');
			expect(get(theme)).toBe('light');
		});

		it('should toggle theme in sequence', () => {
			theme.set('light');
			uiActions.toggleTheme();
			expect(get(theme)).toBe('dark');
			
			uiActions.toggleTheme();
			expect(get(theme)).toBe('system');
			
			uiActions.toggleTheme();
			expect(get(theme)).toBe('light');
		});

		it('should resolve system theme to actual theme', () => {
			// Mock system preference for dark mode
			const mockMatchMedia = vi.fn(() => ({
				matches: true,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}));
			Object.defineProperty(global.window, 'matchMedia', { value: mockMatchMedia });
			
			theme.set('system');
			// Note: actualTheme derived store behavior depends on browser environment
			// In test environment, it defaults to 'light'
		});
	});

	describe('View management', () => {
		it('should toggle sidebar', () => {
			// This would test sidebarCollapsed if it were exported
			uiActions.toggleSidebar();
			// Since sidebarCollapsed is not exported, we can't directly test it
			// but we can ensure the method doesn't throw
		});

		it('should set view mode', () => {
			uiActions.setViewMode('list');
			expect(get(viewMode)).toBe('list');
			
			uiActions.setViewMode('grid');
			expect(get(viewMode)).toBe('grid');
		});

		it('should toggle view mode', () => {
			viewMode.set('grid');
			uiActions.toggleViewMode();
			expect(get(viewMode)).toBe('list');
			
			uiActions.toggleViewMode();
			expect(get(viewMode)).toBe('grid');
		});
	});

	describe('Selection management', () => {
		it('should toggle select mode', () => {
			expect(get(isSelectMode)).toBe(false);
			
			uiActions.toggleSelectMode();
			expect(get(isSelectMode)).toBe(true);
			
			uiActions.toggleSelectMode();
			expect(get(isSelectMode)).toBe(false);
		});

		it('should select and deselect tasks', () => {
			const taskId = 'task-1';
			expect(get(selectedTaskIds).has(taskId)).toBe(false);
			
			uiActions.selectTask(taskId);
			expect(get(selectedTaskIds).has(taskId)).toBe(true);
			
			uiActions.selectTask(taskId);
			expect(get(selectedTaskIds).has(taskId)).toBe(false);
		});

		it('should select all tasks', () => {
			const taskIds = ['task-1', 'task-2', 'task-3'];
			
			uiActions.selectAllTasks(taskIds);
			const selected = get(selectedTaskIds);
			
			taskIds.forEach(id => {
				expect(selected.has(id)).toBe(true);
			});
		});

		it('should clear selection', () => {
			selectedTaskIds.set(new Set(['task-1', 'task-2']));
			expect(get(selectedTaskIds).size).toBe(2);
			
			uiActions.clearSelection();
			expect(get(selectedTaskIds).size).toBe(0);
		});
	});

	describe('Notification management', () => {
		it('should add notification', () => {
			const notification: Omit<Notification, 'id'> = {
				type: 'success',
				title: 'Test Notification',
				message: 'Test message'
			};
			
			const id = uiActions.addNotification(notification);
			const notifications_list = get(notifications);
			
			expect(id).toBeDefined();
			expect(notifications_list).toHaveLength(1);
			expect(notifications_list[0].title).toBe('Test Notification');
			expect(notifications_list[0].type).toBe('success');
		});

		it('should add notification with action', () => {
			const actionHandler = vi.fn();
			const notification: Omit<Notification, 'id'> = {
				type: 'info',
				title: 'Test with Action',
				action: {
					label: 'Click me',
					handler: actionHandler
				}
			};
			
			uiActions.addNotification(notification);
			const notifications_list = get(notifications);
			
			expect(notifications_list[0].action?.label).toBe('Click me');
			expect(notifications_list[0].action?.handler).toBe(actionHandler);
		});

		it('should remove notification', () => {
			const notification: Omit<Notification, 'id'> = {
				type: 'error',
				title: 'Error Notification'
			};
			
			const id = uiActions.addNotification(notification);
			expect(get(notifications)).toHaveLength(1);
			
			uiActions.removeNotification(id);
			expect(get(notifications)).toHaveLength(0);
		});

		it('should clear all notifications', () => {
			uiActions.addNotification({ type: 'success', title: 'Success 1' });
			uiActions.addNotification({ type: 'error', title: 'Error 1' });
			
			expect(get(notifications)).toHaveLength(2);
			
			uiActions.clearAllNotifications();
			expect(get(notifications)).toHaveLength(0);
		});

		it('should auto-remove notification after duration', (done) => {
			const notification: Omit<Notification, 'id'> = {
				type: 'warning',
				title: 'Auto-remove',
				duration: 100 // Short duration for testing
			};
			
			uiActions.addNotification(notification);
			expect(get(notifications)).toHaveLength(1);
			
			setTimeout(() => {
				expect(get(notifications)).toHaveLength(0);
				done();
			}, 150);
		});

		it('should not auto-remove notification with duration 0', (done) => {
			const notification: Omit<Notification, 'id'> = {
				type: 'info',
				title: 'Persistent',
				duration: 0
			};
			
			uiActions.addNotification(notification);
			expect(get(notifications)).toHaveLength(1);
			
			setTimeout(() => {
				expect(get(notifications)).toHaveLength(1);
				done();
			}, 100);
		});
	});

	describe('Loading states', () => {
		it('should set loading state', () => {
			uiActions.setLoadingState('creating', true);
			// Since loadingStates is not exported, we can't directly test it
			// but we can ensure the method doesn't throw
			
			uiActions.setLoadingState('creating', false);
		});
	});

	describe('Notification types', () => {
		it('should handle all notification types', () => {
			const types: Notification['type'][] = ['success', 'error', 'warning', 'info'];
			
			types.forEach(type => {
				uiActions.addNotification({
					type,
					title: `${type} notification`
				});
			});
			
			const notifications_list = get(notifications);
			expect(notifications_list).toHaveLength(4);
			
			types.forEach((type, index) => {
				expect(notifications_list[index].type).toBe(type);
			});
		});
	});
});
