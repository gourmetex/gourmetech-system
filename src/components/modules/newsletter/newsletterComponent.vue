<template>
    <div class="newsletter-component">
        <div class="page-title">
            <h1>Newsletter</h1>
        </div> 
        <div class="card" style="margin-top: var(--space-4);">
            <EmptyState
                icon="mark_email_read"
                title="Módulo Newsletter em Desenvolvimento"
                description="Em breve você poderá gerenciar campanhas de e-mail marketing, novidades do cardápio e cupons exclusivos para sua base de clientes."
            />
        </div>
    </div>
</template>
<script>
import EmptyState from "../../EmptyState.vue";

export default {
    name: "newsletterComponent",
    components: {
        EmptyState
    }
}
</script>
<style scoped>
</style>