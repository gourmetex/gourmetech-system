<template>
    <div class="loading-state" :class="size" role="status" :aria-label="label">
        <span class="loading-spinner" aria-hidden="true"></span>
        <span v-if="message" class="loading-message">{{ message }}</span>
    </div>
</template>

<script>
export default {
    name: 'LoadingState',
    props: { message: { type: String, default: '' }, label: { type: String, default: 'Carregando' }, size: { type: String, default: 'medium' } }
};
</script>

<style scoped>
.loading-state { align-items: center; color: var(--ink-soft); display: flex; flex-direction: column; gap: var(--space-3); justify-content: center; min-height: 120px; }.loading-spinner { animation: loading-spin .8s linear infinite; border: 3px solid var(--line); border-radius: 50%; border-top-color: var(--cor-destaque); height: 34px; width: 34px; }.small { min-height: 56px; }.small .loading-spinner { height: 22px; width: 22px; }.loading-message { font-size: 13px; } @keyframes loading-spin { to { transform: rotate(360deg); } }
</style>
