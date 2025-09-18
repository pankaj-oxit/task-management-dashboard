<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { enableAnimations } from '../stores';

	interface Props {
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		type?: 'danger' | 'warning' | 'info';
		isLoading?: boolean;
	}

	let {
		isOpen = false,
		title,
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		type = 'danger',
		isLoading = false
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	let dialogElement: HTMLElement;

	function handleConfirm() {
		if (!isLoading) {
			dispatch('confirm');
		}
	}

	function handleCancel() {
		if (!isLoading) {
			dispatch('cancel');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	// Focus management
	$effect(() => {
		if (isOpen && dialogElement) {
			const focusableElements = dialogElement.querySelectorAll(
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

			dialogElement.addEventListener('keydown', trapFocus);
			firstElement?.focus();

			return () => {
				dialogElement.removeEventListener('keydown', trapFocus);
			};
		}
	});

	function getIconClass(type: string): string {
		switch (type) {
			case 'danger':
				return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
			case 'warning':
				return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
			default:
				return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
		}
	}

	function getConfirmButtonClass(type: string): string {
		switch (type) {
			case 'danger':
				return 'btn-danger';
			case 'warning':
				return 'btn-warning';
			default:
				return 'btn-primary';
		}
	}

	const iconClass = $derived(getIconClass(type));
	const confirmButtonClass = $derived(getConfirmButtonClass(type));
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="dialog-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		in:fade={{ duration: $enableAnimations ? 200 : 0 }}
		out:fade={{ duration: $enableAnimations ? 150 : 0 }}
		role="presentation"
	>
		<!-- Dialog -->
		<div
			bind:this={dialogElement}
			class="dialog-container"
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-message"
			in:fly={{ y: -20, duration: $enableAnimations ? 300 : 0 }}
			out:fly={{ y: -20, duration: $enableAnimations ? 200 : 0 }}
		>
			<div class="dialog-content">
				<!-- Icon -->
				<div class="dialog-icon-container">
					<div class="dialog-icon {iconClass}">
						{#if type === 'danger'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
								></path>
							</svg>
						{:else if type === 'warning'}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						{:else}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						{/if}
					</div>
				</div>

				<!-- Content -->
				<div class="dialog-text">
					<h3 id="dialog-title" class="dialog-title">
						{title}
					</h3>
					<p id="dialog-message" class="dialog-message">
						{message}
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="dialog-actions">
				<button
					type="button"
					onclick={handleCancel}
					disabled={isLoading}
					class="btn-secondary"
				>
					{cancelText}
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					disabled={isLoading}
					class="btn-confirm {confirmButtonClass}"
				>
					{#if isLoading}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Processing...
					{:else}
						{confirmText}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		@apply fixed inset-0 z-50 flex items-center justify-center p-4;
		background-color: rgb(var(--color-surface-overlay));
		backdrop-filter: blur(4px);
	}

	.dialog-container {
		background-color: rgb(var(--color-surface-elevated));
		border: 1px solid rgb(var(--color-border-primary));
		@apply rounded-lg shadow-xl max-w-md w-full mx-auto;
	}

	.dialog-content {
		@apply p-6 flex items-start gap-4;
	}

	.dialog-icon-container {
		@apply flex-shrink-0;
	}

	.dialog-icon {
		@apply w-12 h-12 rounded-full flex items-center justify-center;
	}

	.dialog-text {
		@apply flex-1 min-w-0;
	}

	.dialog-title {
		color: rgb(var(--color-text-primary));
		@apply text-lg font-semibold mb-2;
	}

	.dialog-message {
		color: rgb(var(--color-text-secondary));
		@apply text-sm leading-relaxed;
	}

	.dialog-actions {
		background-color: rgb(var(--color-bg-tertiary));
		@apply px-6 py-4 rounded-b-lg;
		@apply flex items-center justify-end gap-3;
	}

	.btn-secondary {
		background-color: rgb(var(--color-bg-secondary));
		border: 1px solid rgb(var(--color-border-primary));
		color: rgb(var(--color-text-primary));
		@apply inline-flex items-center px-4 py-2 text-sm font-medium rounded-md;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900;
		@apply disabled:opacity-50 disabled:cursor-not-allowed;
		@apply transition-all duration-200 ease-in-out;
		@apply shadow-sm hover:shadow-md;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: rgb(var(--color-hover-bg));
		border-color: rgb(var(--color-border-secondary));
	}

	.btn-confirm {
		@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900;
		@apply disabled:opacity-50 disabled:cursor-not-allowed;
		@apply transition-all duration-200 ease-in-out;
		@apply shadow-sm hover:shadow-md;
	}

	.btn-primary {
		@apply text-white bg-primary-600 hover:bg-primary-700;
		@apply focus:ring-primary-500;
	}

	.btn-danger {
		@apply text-white bg-red-600 hover:bg-red-700;
		@apply focus:ring-red-500;
	}

	.btn-warning {
		@apply text-white bg-yellow-600 hover:bg-yellow-700;
		@apply focus:ring-yellow-500;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
