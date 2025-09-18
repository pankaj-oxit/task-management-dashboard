<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import type { Notification } from '../stores/uiStore';
	import { enableAnimations } from '../stores';

	interface Props {
		notification: Notification;
	}

	let { notification }: Props = $props();

	const dispatch = createEventDispatcher<{
		dismiss: string;
	}>();

	function handleDismiss() {
		dispatch('dismiss', notification.id);
	}

	function handleAction() {
		if (notification.action) {
			notification.action.handler();
			handleDismiss();
		}
	}

	function getIconClass(type: Notification['type']): string {
		switch (type) {
			case 'success':
				return 'text-green-400';
			case 'error':
				return 'text-red-400';
			case 'warning':
				return 'text-yellow-400';
			default:
				return 'text-blue-400';
		}
	}

	function getBgClass(type: Notification['type']): string {
		switch (type) {
			case 'success':
				return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
			case 'error':
				return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
			case 'warning':
				return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
			default:
				return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
		}
	}

	const iconClass = $derived(getIconClass(notification.type));
	const bgClass = $derived(getBgClass(notification.type));
</script>

<div
	class="notification-toast {bgClass}"
	role="alert"
	aria-live="assertive"
	in:fly={{ x: 300, duration: $enableAnimations ? 300 : 0 }}
	out:fade={{ duration: $enableAnimations ? 200 : 0 }}
>
	<!-- Icon -->
	<div class="notification-icon {iconClass}">
		{#if notification.type === 'success'}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				></path>
			</svg>
		{:else if notification.type === 'error'}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				></path>
			</svg>
		{:else if notification.type === 'warning'}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
		{:else}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
		{/if}
	</div>

	<!-- Content -->
	<div class="notification-content">
		<div class="notification-title">
			{notification.title}
		</div>
		{#if notification.message}
			<div class="notification-message">
				{notification.message}
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="notification-actions">
		{#if notification.action}
			<button
				type="button"
				onclick={handleAction}
				class="notification-action-btn"
			>
				{notification.action.label}
			</button>
		{/if}
		
		<button
			type="button"
			onclick={handleDismiss}
			class="notification-dismiss-btn"
			aria-label="Dismiss notification"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				></path>
			</svg>
		</button>
	</div>
</div>

<style>
	.notification-toast {
		@apply flex items-start gap-3 p-4 rounded-lg border shadow-lg hover:shadow-xl;
		@apply max-w-sm w-full;
		@apply transition-all duration-200 ease-in-out;
		@apply backdrop-blur-sm;
	}

	.notification-icon {
		background-color: rgb(var(--color-surface-elevated));
		@apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center;
		@apply shadow-sm;
	}

	.notification-content {
		@apply flex-1 min-w-0;
	}

	.notification-title {
		color: rgb(var(--color-text-primary));
		@apply text-sm font-medium;
	}

	.notification-message {
		color: rgb(var(--color-text-secondary));
		@apply text-sm mt-1;
	}

	.notification-actions {
		@apply flex items-start gap-2 flex-shrink-0;
	}

	.notification-action-btn {
		@apply text-sm font-medium underline;
		@apply text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 rounded;
		@apply transition-all duration-200 ease-in-out;
		@apply hover:scale-105;
	}

	.notification-dismiss-btn {
		color: rgb(var(--color-text-tertiary));
		@apply p-1 rounded-md;
		@apply hover:text-gray-600 dark:hover:text-gray-300;
		@apply hover:bg-white dark:hover:bg-gray-800;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500;
		@apply transition-all duration-200 ease-in-out;
		@apply hover:scale-110;
	}
</style>
