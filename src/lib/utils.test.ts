import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from './types';
import {
	generateId,
	formatDate,
	formatDateTime,
	getRelativeTime,
	getStatusColor,
	getStatusIcon,
	filterTasks,
	sortTasks,
	validateTaskTitle,
	validateTaskDescription,
	saveToLocalStorage,
	loadFromLocalStorage,
	getSystemTheme,
	applyTheme,
	createSlideTransition,
	createScaleTransition
} from './utils';

describe('generateId', () => {
	it('should generate unique IDs', () => {
		const id1 = generateId();
		const id2 = generateId();
		
		expect(id1).toBeDefined();
		expect(id2).toBeDefined();
		expect(id1).not.toBe(id2);
		expect(typeof id1).toBe('string');
		expect(typeof id2).toBe('string');
	});
});

describe('Date formatting utilities', () => {
	const testDate = new Date('2024-01-15T14:30:00Z');

	describe('formatDate', () => {
		it('should format date correctly', () => {
			const formatted = formatDate(testDate);
			expect(formatted).toMatch(/Jan \d{1,2}, 2024/);
		});
	});

	describe('formatDateTime', () => {
		it('should format date and time correctly', () => {
			const formatted = formatDateTime(testDate);
			expect(formatted).toMatch(/Jan \d{1,2}, 2024(,| at) \d{1,2}:\d{2} [AP]M/);
		});
	});

	describe('getRelativeTime', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('should return "Just now" for very recent dates', () => {
			const now = new Date();
			const recent = new Date(now.getTime() - 30000); // 30 seconds ago
			vi.setSystemTime(now);
			
			expect(getRelativeTime(recent)).toBe('Just now');
		});

		it('should return minutes ago for recent dates', () => {
			const now = new Date();
			const recent = new Date(now.getTime() - 300000); // 5 minutes ago
			vi.setSystemTime(now);
			
			expect(getRelativeTime(recent)).toBe('5m ago');
		});

		it('should return hours ago for older dates', () => {
			const now = new Date();
			const recent = new Date(now.getTime() - 7200000); // 2 hours ago
			vi.setSystemTime(now);
			
			expect(getRelativeTime(recent)).toBe('2h ago');
		});

		it('should return days ago for even older dates', () => {
			const now = new Date();
			const recent = new Date(now.getTime() - 172800000); // 2 days ago
			vi.setSystemTime(now);
			
			expect(getRelativeTime(recent)).toBe('2d ago');
		});

		it('should return formatted date for very old dates', () => {
			const now = new Date();
			const old = new Date(now.getTime() - 1209600000); // 2 weeks ago
			vi.setSystemTime(now);
			
			const result = getRelativeTime(old);
			expect(result).toMatch(/\w{3} \d{1,2}/); // Should be formatted date
		});
	});
});

describe('Task status utilities', () => {
	describe('getStatusColor', () => {
		it('should return correct colors for each status', () => {
			expect(getStatusColor('pending')).toContain('yellow');
			expect(getStatusColor('in-progress')).toContain('blue');
			expect(getStatusColor('completed')).toContain('green');
		});

		it('should return default color for unknown status', () => {
			expect(getStatusColor('unknown' as any)).toContain('gray');
		});
	});

	describe('getStatusIcon', () => {
		it('should return correct icons for each status', () => {
			expect(getStatusIcon('pending')).toBe('⏳');
			expect(getStatusIcon('in-progress')).toBe('🔄');
			expect(getStatusIcon('completed')).toBe('✅');
		});

		it('should return default icon for unknown status', () => {
			expect(getStatusIcon('unknown' as any)).toBe('❓');
		});
	});
});

describe('Task filtering and sorting', () => {
	const mockTasks: Task[] = [
		{
			id: '1',
			title: 'First Task',
			description: 'Description one',
			status: 'pending',
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01')
		},
		{
			id: '2',
			title: 'Second Task',
			description: 'Description two',
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

	describe('filterTasks', () => {
		it('should return all tasks when filter is "all"', () => {
			const filtered = filterTasks(mockTasks, 'all', '');
			expect(filtered).toHaveLength(3);
		});

		it('should filter by status correctly', () => {
			const pendingTasks = filterTasks(mockTasks, 'pending', '');
			expect(pendingTasks).toHaveLength(1);
			expect(pendingTasks[0].status).toBe('pending');

			const completedTasks = filterTasks(mockTasks, 'completed', '');
			expect(completedTasks).toHaveLength(1);
			expect(completedTasks[0].status).toBe('completed');
		});

		it('should filter by search query in title', () => {
			const filtered = filterTasks(mockTasks, 'all', 'First');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('First Task');
		});

		it('should filter by search query in description', () => {
			const filtered = filterTasks(mockTasks, 'all', 'two');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].description).toBe('Description two');
		});

		it('should handle case-insensitive search', () => {
			const filtered = filterTasks(mockTasks, 'all', 'FIRST');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('First Task');
		});

		it('should combine status and search filters', () => {
			const filtered = filterTasks(mockTasks, 'pending', 'First');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('First Task');
			expect(filtered[0].status).toBe('pending');
		});

		it('should return empty array when no matches', () => {
			const filtered = filterTasks(mockTasks, 'all', 'nonexistent');
			expect(filtered).toHaveLength(0);
		});
	});

	describe('sortTasks', () => {
		it('should sort by title ascending', () => {
			const sorted = sortTasks(mockTasks, 'title', 'asc');
			expect(sorted[0].title).toBe('First Task');
			expect(sorted[1].title).toBe('Second Task');
			expect(sorted[2].title).toBe('Third Task');
		});

		it('should sort by title descending', () => {
			const sorted = sortTasks(mockTasks, 'title', 'desc');
			expect(sorted[0].title).toBe('Third Task');
			expect(sorted[1].title).toBe('Second Task');
			expect(sorted[2].title).toBe('First Task');
		});

		it('should sort by createdAt ascending', () => {
			const sorted = sortTasks(mockTasks, 'createdAt', 'asc');
			expect(sorted[0].id).toBe('1');
			expect(sorted[1].id).toBe('2');
			expect(sorted[2].id).toBe('3');
		});

		it('should sort by createdAt descending', () => {
			const sorted = sortTasks(mockTasks, 'createdAt', 'desc');
			expect(sorted[0].id).toBe('3');
			expect(sorted[1].id).toBe('2');
			expect(sorted[2].id).toBe('1');
		});

		it('should sort by status with custom order', () => {
			const sorted = sortTasks(mockTasks, 'status', 'asc');
			expect(sorted[0].status).toBe('pending');
			expect(sorted[1].status).toBe('in-progress');
			expect(sorted[2].status).toBe('completed');
		});

		it('should not mutate original array', () => {
			const original = [...mockTasks];
			sortTasks(mockTasks, 'title', 'asc');
			expect(mockTasks).toEqual(original);
		});
	});
});

describe('Validation utilities', () => {
	describe('validateTaskTitle', () => {
		it('should return error for empty title', () => {
			expect(validateTaskTitle('')).toBe('Title is required');
			expect(validateTaskTitle('   ')).toBe('Title is required');
		});

		it('should return error for too short title', () => {
			expect(validateTaskTitle('ab')).toBe('Title must be at least 3 characters');
		});

		it('should return error for too long title', () => {
			const longTitle = 'a'.repeat(101);
			expect(validateTaskTitle(longTitle)).toBe('Title must be less than 100 characters');
		});

		it('should return null for valid title', () => {
			expect(validateTaskTitle('Valid Title')).toBe(null);
			expect(validateTaskTitle('   Valid Title   ')).toBe(null);
		});
	});

	describe('validateTaskDescription', () => {
		it('should return null for empty description', () => {
			expect(validateTaskDescription('')).toBe(null);
		});

		it('should return error for too long description', () => {
			const longDesc = 'a'.repeat(501);
			expect(validateTaskDescription(longDesc)).toBe('Description must be less than 500 characters');
		});

		it('should return null for valid description', () => {
			expect(validateTaskDescription('Valid description')).toBe(null);
		});
	});
});

describe('Local storage utilities', () => {
	const mockLocalStorage = {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn()
	};

	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, 'localStorage', {
			value: mockLocalStorage,
			writable: true
		});
	});

	describe('saveToLocalStorage', () => {
		it('should save data to localStorage', () => {
			const data = { test: 'value' };
			saveToLocalStorage('test-key', data);
			
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(data));
		});

		it('should handle errors gracefully', () => {
			mockLocalStorage.setItem.mockImplementation(() => {
				throw new Error('Storage error');
			});
			
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			expect(() => saveToLocalStorage('test-key', { test: 'value' })).not.toThrow();
			expect(consoleSpy).toHaveBeenCalled();
			
			consoleSpy.mockRestore();
		});
	});

	describe('loadFromLocalStorage', () => {
		it('should load data from localStorage', () => {
			const data = { test: 'value' };
			mockLocalStorage.getItem.mockReturnValue(JSON.stringify(data));
			
			const result = loadFromLocalStorage('test-key', { default: 'value' });
			expect(result).toEqual(data);
		});

		it('should return default value when key not found', () => {
			mockLocalStorage.getItem.mockReturnValue(null);
			
			const defaultValue = { default: 'value' };
			const result = loadFromLocalStorage('test-key', defaultValue);
			expect(result).toEqual(defaultValue);
		});

		it('should return default value on JSON parse error', () => {
			mockLocalStorage.getItem.mockReturnValue('invalid json');
			
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const defaultValue = { default: 'value' };
			const result = loadFromLocalStorage('test-key', defaultValue);
			
			expect(result).toEqual(defaultValue);
			expect(consoleSpy).toHaveBeenCalled();
			
			consoleSpy.mockRestore();
		});
	});
});

describe('Theme utilities', () => {
	describe('getSystemTheme', () => {
		it('should return dark when system prefers dark', () => {
			const mockMatchMedia = vi.fn(() => ({
				matches: true,
				addListener: vi.fn(),
				removeListener: vi.fn()
			}));
			Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia });
			
			expect(getSystemTheme()).toBe('dark');
		});

		it('should return light when system prefers light', () => {
			const mockMatchMedia = vi.fn(() => ({
				matches: false,
				addListener: vi.fn(),
				removeListener: vi.fn()
			}));
			Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia });
			
			expect(getSystemTheme()).toBe('light');
		});
	});

	describe('applyTheme', () => {
		it('should add dark class for dark theme', () => {
			const mockClassList = {
				add: vi.fn(),
				remove: vi.fn()
			};
			Object.defineProperty(document, 'documentElement', {
				value: { classList: mockClassList },
				writable: true
			});
			
			applyTheme('dark');
			expect(mockClassList.add).toHaveBeenCalledWith('dark');
		});

		it('should remove dark class for light theme', () => {
			const mockClassList = {
				add: vi.fn(),
				remove: vi.fn()
			};
			Object.defineProperty(document, 'documentElement', {
				value: { classList: mockClassList },
				writable: true
			});
			
			applyTheme('light');
			expect(mockClassList.remove).toHaveBeenCalledWith('dark');
		});
	});
});

describe('Animation utilities', () => {
	const mockElement = document.createElement('div');

	describe('createSlideTransition', () => {
		it('should return transition object with default values', () => {
			const transition = createSlideTransition(mockElement, {});
			
			expect(transition.delay).toBe(0);
			expect(transition.duration).toBe(300);
			expect(typeof transition.css).toBe('function');
		});

		it('should return transition object with custom values', () => {
			const transition = createSlideTransition(mockElement, { delay: 100, duration: 500 });
			
			expect(transition.delay).toBe(100);
			expect(transition.duration).toBe(500);
		});

		it('should generate correct CSS', () => {
			const transition = createSlideTransition(mockElement, {});
			const css = transition.css(0.5);
			
			expect(css).toContain('translateY(10px)');
			expect(css).toContain('opacity: 0.5');
		});
	});

	describe('createScaleTransition', () => {
		it('should return transition object with default values', () => {
			const transition = createScaleTransition(mockElement, {});
			
			expect(transition.delay).toBe(0);
			expect(transition.duration).toBe(200);
			expect(typeof transition.css).toBe('function');
		});

		it('should generate correct CSS', () => {
			const transition = createScaleTransition(mockElement, {});
			const css = transition.css(0.5);
			
			expect(css).toContain('scale(0.975)');
			expect(css).toContain('opacity: 0.5');
		});
	});
});