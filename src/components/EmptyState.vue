<template>
    <div class="empty-state">
        <span class="material-icons empty-icon" aria-hidden="true">{{ icon }}</span>
        <p>{{ message }}</p>
        <slot />
    </div>
</template>

<script>
export default { name: 'EmptyState', props: { icon: { type: String, default: 'inbox' }, message: { type: String, default: 'Nada para mostrar por aqui.' } } };
</script>

<style scoped>
.empty-state { align-items: center; color: var(--ink-soft); display: flex; flex-direction: column; gap: var(--space-3); justify-content: center; min-height: 150px; padding: var(--space-6); text-align: center; }.empty-icon { color: var(--orange); font-size: 42px; }.empty-state p { color: inherit; font-size: 14px; }
</style>
