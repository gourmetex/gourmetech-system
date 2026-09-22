<template>
    <div class="toast-host" aria-live="polite" aria-atomic="true">
        <transition-group name="toast" tag="div">
            <div v-for="item in items" :key="item.id" class="toast" :class="`toast-${item.type}`" role="status">
                <span class="material-icons" aria-hidden="true">{{ iconFor(item.type) }}</span>
                <span class="toast-message">{{ item.message }}</span>
                <button class="toast-close" type="button" aria-label="Fechar aviso" @click="remove(item.id)">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </transition-group>
    </div>
</template>

<script>
import { toastBus } from '@/js/toast';

export default {
    name: 'ToastHost',
    data: () => ({ items: [] }),
    created() {
        toastBus.$on('toast', this.add);
    },
    beforeDestroy() {
        toastBus.$off('toast', this.add);
    },
    methods: {
        add(item) {
            this.items.push(item);
            window.setTimeout(() => this.remove(item.id), item.duration);
        },
        remove(id) {
            this.items = this.items.filter(item => item.id !== id);
        },
        iconFor(type) {
            return { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[type] || 'info';
        }
    }
};
</script>

<style scoped>
.toast-host { position: fixed; top: 20px; right: 20px; z-index: 100; width: min(390px, calc(100vw - 40px)); }
.toast { align-items: center; background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--info); border-radius: var(--radius-m); box-shadow: 0 12px 30px rgba(43, 38, 32, .16); color: var(--ink); display: flex; gap: var(--space-3); margin-bottom: var(--space-3); padding: 12px; }
.toast-success { border-left-color: var(--good); }.toast-error { border-left-color: var(--bad); }.toast-warning { border-left-color: var(--warn); }
.toast-message { flex: 1; font-size: 14px; line-height: 1.45; }.toast-close { align-items: center; background: transparent; border: 0; color: var(--ink-soft); cursor: pointer; display: flex; padding: 2px; }
.toast-close .material-icons { font-size: 18px; }.toast-enter-active, .toast-leave-active { transition: all .18s ease; }.toast-enter, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
