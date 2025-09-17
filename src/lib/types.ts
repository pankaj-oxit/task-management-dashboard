// Task-related types
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateTaskData {
	title: string;
	description?: string;
	status: TaskStatus;
}

export interface UpdateTaskData {
	title?: string;
	description?: string;
	status?: TaskStatus;
}

// UI State types
export interface FilterState {
	status: TaskStatus | 'all';
	searchQuery: string;
}

export interface ModalState {
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;
	isDeleteModalOpen: boolean;
	editingTask: Task | null;
	deletingTask: Task | null;
}

export interface UIState {
	isDarkMode: boolean;
	isLoading: boolean;
	error: string | null;
}

// API Response types
export interface ApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
}

export interface TasksResponse extends ApiResponse<Task[]> {}
export interface TaskResponse extends ApiResponse<Task> {}

// Form validation types
export interface ValidationError {
	field: string;
	message: string;
}

export interface FormState {
	isValid: boolean;
	errors: ValidationError[];
	isSubmitting: boolean;
}

// Sort options
export type SortField = 'title' | 'createdAt' | 'updatedAt' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
	field: SortField;
	direction: SortDirection;
}

// Drag and drop types (for future enhancement)
export interface DragDropState {
	isDragging: boolean;
	draggedTask: Task | null;
	dropTarget: string | null;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Configuration types
export interface AppConfig {
	theme: Theme;
	itemsPerPage: number;
	enableAnimations: boolean;
	autoSave: boolean;
}
