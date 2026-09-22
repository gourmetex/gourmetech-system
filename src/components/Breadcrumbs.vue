<template>
    <nav v-if="items.length" class="BreadcrumbsComponent" aria-label="Navegação estrutural">
        <span v-for="(item, index) in items" :key="item.label">
            <router-link v-if="item.to && index < items.length - 1" :to="item.to">{{ item.label }}</router-link>
            <span v-else :aria-current="index === items.length - 1 ? 'page' : null">{{ item.label }}</span>
            <span v-if="index < items.length - 1" class="material-icons breadcrumb-separator" aria-hidden="true">chevron_right</span>
        </span>
    </nav>
</template>

<script>
const labels = { admin: 'Administração', products: 'Produtos', config: 'Configurações', stock: 'Estoque', orders: 'Vendas', customers: 'Clientes', kitchen: 'Cozinha', digital_menu: 'Menu digital', financial: 'Financeiro', shipping: 'Entregas', reports: 'Relatórios', reservations: 'Reservas', sales: 'Promoções', profile: 'Perfil', whatsapp: 'WhatsApp', newsletter: 'Newsletter', printout: 'Impressão' };
export default {
    name: 'BreadcrumbsComponentComponent',
    computed: {
        items() {
            const path = this.$route.path.replace(/^\/home\/?/, '');
            if (!path) return [{ label: 'Início' }];
            const section = path.split('/')[0];
            return [{ label: 'Início', to: '/home' }, { label: this.$route.meta.breadcrumb || labels[section] || 'Sistema' }];
        }
    }
};
</script>

<style scoped>
.BreadcrumbsComponent { align-items: center; color: var(--ink-soft); display: flex; font-size: 12px; margin: 0 0 var(--space-3); }.BreadcrumbsComponent > span { align-items: center; display: inline-flex; }.BreadcrumbsComponent a { color: var(--cor-destaque); }.breadcrumb-separator { font-size: 16px; margin: 0 3px; }
</style>
