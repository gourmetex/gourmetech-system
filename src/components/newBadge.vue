<template>
    <div class="badge" :class="statusClass" :style="badgeStyle">
        <h3 :style="textStyle" v-html="text || label"></h3>
    </div>
</template>
<script>
import { globalMethods } from '@/js/globalMethods';

export default {
    name: "newBadge",
    mixins: [globalMethods],
    props: {
        background: { type: String, default: '' },
        label: { type: String, default: '' },
        text: { type: String, default: '' },
        status: { type: String, default: 'neutral' }
    },
    computed: {
        statusClass() { return this.background ? 'badge-custom' : `badge-${this.status}`; },
        badgeStyle() { return this.background ? { background: this.background } : {}; },
        textStyle() { return this.background ? { color: this.getContrastColorFromCssVariable(this.background) } : {}; }
    }
}
</script>
<style scoped>
.badge {
    margin: auto;
    width: 100%;
    min-width: 70px;
    max-width: fit-content;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2) var(--space-4);
    border-radius: 999px;
    border: 1px solid transparent;
}
.badge h3 { font-size: 12px; font-weight: 700; }
.badge-success { background: var(--good-soft); color: var(--good); }.badge-warning { background: var(--warn-soft); color: var(--warn); }.badge-danger { background: var(--bad-soft); color: var(--bad); }.badge-info { background: var(--info-soft); color: var(--info); }.badge-neutral { background: var(--paper); border-color: var(--line); color: var(--ink-soft); }
</style>
