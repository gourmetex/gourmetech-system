<template>
    <div class="badge" :style="'background: ' + backcolor">
        <h3 :style="'color: ' + forecolor">{{ content }}</h3>
    </div>
</template>
<script>
export default {
    name: "badgeComponent",
    props: ["content", "backcolor", "forecolor"]
}
</script>
<style scoped>
.badge {
    width: fit-content;
    min-width: 70px;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-lg);
}
</style>