<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { enableAnimations } from '../stores';

	interface Props {
		isOpen: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		showCloseButton?: boolean;
		children?: any;
	}

	let {
		isOpen = false,
		title,
		size = 'md',
		showCloseButton = true,
		children
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let modalElement: HTMLElement;

	function handleClose() {
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	// Focus management
	$effect(() => {
		if (isOpen && modalElement) {
			const focusableElements = modalElement.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			function trapFocus(e: KeyboardEvent) {
				if (e.key === 'Tab') {
					if (e.shiftKey) {
						if (document.activeElement === firstElement) {
							e.preventDefault();
							lastElement?.focus();
						}
					} else {
						if (document.activeElement === lastElement) {
							e.preventDefault();
							firstElement?.focus();
						}
					}
				}
			}

			modalElement.addEventListener('keydown', trapFocus);
			firstElement?.focus();

			// Prevent body scroll
			document.body.style.overflow = 'hidden';

			return () => {
				modalElement.removeEventListener('keydown', trapFocus);
				document.body.style.overflow = '';
			};
		}
	});

	function getSizeClass(size: string): string {
		switch (size) {
			case 'sm':
				return 'max-w-sm';
			case 'md':
				return 'max-w-md';
			case 'lg':
				return 'max-w-lg';
			case 'xl':
				return 'max-w-xl';
			default:
				return 'max-w-md';
		}
	}

	const sizeClass = $derived(getSizeClass(size));
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		in:fade={{ duration: $enableAnimations ? 200 : 0 }}
		out:fade={{ duration: $enableAnimations ? 150 : 0 }}
		role="presentation"
	>
		<!-- Modal -->
		<div
			bind:this={modalElement}
			class="modal-container {sizeClass}"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
			in:fly={{ y: -20, duration: $enableAnimations ? 300 : 0 }}
			out:fly={{ y: -20, duration: $enableAnimations ? 200 : 0 }}
		>
			{#if title || showCloseButton}
				<div class="modal-header">
					{#if title}
						<h2 id="modal-title" class="modal-title">
							{title}
						</h2>
					{/if}
					
					{#if showCloseButton}
						<button
							type="button"
							onclick={handleClose}
							class="close-button"
							aria-label="Close modal"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			<div class="modal-content">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		@apply fixed inset-0 z-50 flex items-center justify-center p-4;
		@apply bg-black bg-opacity-50 dark:bg-opacity-70;
	}

	.modal-container {
		@apply w-full mx-auto;
		@apply bg-white dark:bg-gray-800 rounded-lg shadow-xl;
		@apply border border-gray-200 dark:border-gray-700;
		@apply max-h-[90vh] flex flex-col;
	}

	.modal-header {
		@apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
		@apply flex-shrink-0;
	}

	.modal-title {
		@apply text-xl font-semibold text-gray-900 dark:text-gray-100;
	}

	.close-button {
		@apply p-2 rounded-md;
		@apply text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
		@apply hover:bg-gray-100 dark:hover:bg-gray-700;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
		@apply transition-colors duration-200;
	}

	.modal-content {
		@apply flex-1 overflow-y-auto;
	}
</style>
