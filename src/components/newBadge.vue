<template>
    <div class="badge" :style="'background: ' + background">
        <h3 :style="'color: ' + getContrastColorFromCssVariable(background)" v-html="text"></h3>
    </div>
</template>
<script>
import { globalMethods } from '@/js/globalMethods';

export default {
    name: "newBadge",
    mixins: [globalMethods],
    props: ["background", "label", "text"]
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
    border-radius: var(--radius-lg);
}
</style>