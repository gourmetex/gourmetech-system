<template>
    <div class="signature">
        <p>© {{ new Date().getFullYear() }} Gourmetech - Todos os direitos reservados.</p>
    </div>
</template>
<script>
export default {
    name: "signatureComponents"
}
</script>
<style scoped>
.signature {
    position: fixed;
    bottom: var(--space-7);
    left: 0;
    right: 0;
    width: fit-content;
    margin: auto;
}
</style>