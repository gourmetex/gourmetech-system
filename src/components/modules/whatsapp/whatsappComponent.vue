<template>
    <div class="whatsapp-component">
        <div class="page-title">
            <h1>WhatsApp</h1>
        </div> 
        <div class="card" style="margin-top: var(--space-4);">
            <EmptyState
                icon="forum"
                title="Módulo WhatsApp em Desenvolvimento"
                description="Em breve você poderá disparar notificações automáticas de pedidos, atualizações de entrega e campanhas promocionais diretamente pelo WhatsApp."
            />
        </div>
    </div>
</template>
<script>
import EmptyState from "../../EmptyState.vue";

export default {
    name: "whatsappComponent",
    components: {
        EmptyState
    }
}
</script>
<style scoped>
</style>