import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = vi.fn(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	unobserve: vi.fn(),
}));

// Mock ResizeObserver
(globalThis as any).ResizeObserver = vi.fn(() => ({
	disconnect: vi.fn(),
	observe: vi.fn(),
	unobserve: vi.fn(),
}));
