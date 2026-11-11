<template>
    <div class="config-component">
        <div class="page-title">
            <h1>Configurações</h1>
        </div>
        <div class="config-content">
            <nav v-if="filteredConfigMenus.length" class="config-navigation" aria-label="Navegação de configurações">
                <div class="navigation-label">CATEGORIAS</div>
                <div class="category-list" aria-label="Categorias de configurações">
                    <button v-for="menu in filteredConfigMenus" :key="menu.id" type="button"
                        class="category-button" :class="{ 'is-active': activeMenuId === menu.id }"
                        :aria-pressed="activeMenuId === menu.id" @click="selectConfigOption(menu)">
                        <span class="material-icons" aria-hidden="true">{{ menu.icon }}</span>
                        <span>{{ menu.name }}</span>
                    </button>
                </div>
                <div v-if="activeMenu" class="subcategory-section">
                    <div class="subcategory-heading"><span class="material-icons" aria-hidden="true">{{ activeMenu.icon }}</span><span>{{ activeMenu.name }}</span></div>
                    <div class="subcategory-list" :aria-label="'Opções de ' + activeMenu.name">
                        <button v-for="subMenu in activeMenu.subMenus" :key="subMenu.link" type="button"
                            class="subcategory-button" :class="{ 'is-active': activeSection === subMenu.link }"
                            :aria-pressed="activeSection === subMenu.link" @click="selectThisConfig(subMenu)">
                            {{ subMenu.name }}
                        </button>
                    </div>
                </div>
            </nav>
            <div class="config-inner-page">
                <div class="not-showing" v-if="notShowingSubMenuContent">
                    <EmptyState icon="tune" title="Nenhuma configuração selecionada" description="Selecione uma categoria no menu acima para gerenciar as configurações." />
                </div>
                <systemConfig v-if="showSections.systemConfig"></systemConfig>
                <rolesConfig v-if="showSections.rolesConfig"></rolesConfig>
                <usersConfig v-if="showSections.usersConfig"></usersConfig>
                <ingredientsConfig v-if="showSections.ingredientsConfig"></ingredientsConfig>
                <ingredientsCategoriesConfig v-if="showSections.ingredientsCategoriesConfig"></ingredientsCategoriesConfig>
                <productsCategories v-if="showSections.productsCategories"></productsCategories>
                <tablesConfig v-if="showSections.tablesConfig"></tablesConfig>
                <financialConfig v-if="showSections.financialConfig"></financialConfig>
                <reservationPreferences v-if="showSections.reservationPreferences" @cancel="resetConfigOptions"></reservationPreferences>
                <shippingConfig v-if="showSections.shippingConfig" @cancel="resetConfigOptions"></shippingConfig>
                <shippingDriversConfig v-if="showSections.shippingDriversConfig"></shippingDriversConfig>
                <systemData v-if="showSections.systemData" @cancel="resetConfigOptions"></systemData>
                <systemLinkedCompanies v-if="showSections.systemLinkedCompanies"></systemLinkedCompanies>
                <systemPreferences v-if="showSections.systemPreferences"></systemPreferences>
            </div>
        </div>
    </div>
</template>
<script>
import EmptyState from "./EmptyState.vue";
import systemConfig from "./config/systemConfig.vue";
import rolesConfig from "./config/rolesConfig.vue";
import usersConfig from "./config/usersConfig.vue";
import ingredientsConfig from "./config/ingredientsConfig.vue";
import tablesConfig from "./config/tablesConfig.vue";
import financialConfig from "./config/financialConfig.vue";
import reservationPreferences from "./config/reservationPreferences.vue";
import shippingConfig from "./config/shippingConfig.vue";
import shippingDriversConfig from "./config/shippingDriversConfig.vue";
import systemData from "./config/systemData.vue";
import systemLinkedCompanies from "./config/systemLinkedCompanies.vue";
import systemPreferences from "./config/systemPreferences.vue";

export default {
    name: "configComponent",
    data() {
        return {
            configMenus: [
                {
                    id: 1,
                    name: "Componentes de produtos",
                    icon: "category",
                    modulo_requerido: "products",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar tipos",
                            link: "ingredientsConfig"
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Usuários",
                    icon: "group",
                    modulo_requerido: "config",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar usuários",
                            link: "usersConfig"
                        },
                        {
                            id: 1,
                            name: "Cargos",
                            link: "rolesConfig"
                        }
                    ]
                },
                {
                    id: 3,
                    name: "Sistema",
                    icon: "settings",
                    modulo_requerido: "config",
                    subMenus: [
                        {
                            id: 0,
                            name: "Dados da empresa",
                            link: "systemData"
                        },
                        {
                            id: 1,
                            name: "Personalização",
                            link: "systemConfig"
                        },
                        {
                            id: 2,
                            name: "Empresas vinculadas",
                            link: "systemLinkedCompanies"
                        },
                        {
                            id: 3,
                            name: "Preferências do sistema",
                            link: "systemPreferences"
                        }
                    ]
                },
                {
                    id: 4,
                    name: "Mesas",
                    icon: "table_restaurant",
                    modulo_requerido: "digital_menu",
                    subMenus: [
                        {
                            id: 0,
                            name: "Listar mesas",
                            link: "tablesConfig"
                        }
                    ]
                },
                {
                    id: 5,
                    name: "Financeiro",
                    icon: "account_balance_wallet",
                    modulo_requerido: "financial",
                    subMenus: [
                        {
                            id: 0,
                            name: "Categorias de contas",
                            link: "financialConfig"
                        }
                    ]
                },
                {
                    id: 6,
                    name: "Reservas",
                    icon: "event_available",
                    modulo_requerido: "reservations",
                    subMenus: [
                        {
                            id: 0,
                            name: "Preferências",
                            link: "reservationPreferences"
                        }
                    ]
                },
                {
                    id: 7,
                    name: "Entregas",
                    icon: "local_shipping",
                    modulo_requerido: "shipping",
                    subMenus: [
                        {
                            id: 0,
                            name: "Configurar taxa",
                            link: "shippingConfig"
                        },
                        {
                            id: 1,
                            name: "Entregadores",
                            link: "shippingDriversConfig"
                        }
                    ]
                }
            ],
            activeMenuId: null,
            activeSection: null,
            showSections: {
                systemConfig: false,
                rolesConfig: false,
                usersConfig: false,
                ingredientsConfig: false,
                tablesConfig: false,
                financialConfig: false,
                reservationPreferences: false,
                shippingConfig: false,
                shippingDriversConfig: false,
                systemData: false,
                systemLinkedCompanies: false,
                systemPreferences: false
            }
        }
    },
    computed: {
        activeMenu() {
            return this.filteredConfigMenus.find(menu => menu.id === this.activeMenuId) || null;
        },
        notShowingSubMenuContent() {
            return Object.values(this.showSections).every(property => !property);
        },
        filteredConfigMenus: function () {
            let filteredMenus = [];

            for (let i = 0; i < this.configMenus.length; i++) {
                if (this.$root.menuOptions.some(modulo => modulo.codigo === this.configMenus[i].modulo_requerido)) {
                    filteredMenus.push(this.configMenus[i]);
                }
            }

            return filteredMenus;
        }
    },
    watch: {
        filteredConfigMenus: {
            immediate: true,
            handler(menus) {
                if (!menus.length) { this.resetConfigOptions(); return; }
                if (!menus.some(menu => menu.id === this.activeMenuId)) this.selectConfigOption(menus[0]);
            }
        }
    },
    methods: {
        selectThisConfig(subMenu) {
            if (!subMenu || !Object.prototype.hasOwnProperty.call(this.showSections, subMenu.link)) return;
            Object.keys(this.showSections).forEach(key => { this.showSections[key] = false; });
            this.activeSection = subMenu.link;
            this.showSections[subMenu.link] = true;
        },
        selectConfigOption(menu) {
            this.activeMenuId = menu.id;
            this.activeSection = null;
            if (menu.subMenus.length) this.selectThisConfig(menu.subMenus[0]);
        },
        resetConfigOptions() {
            this.activeMenuId = null;
            this.activeSection = null;
            Object.keys(this.showSections).forEach(key => { this.showSections[key] = false; });
        }
    },
    components: {
        EmptyState,
        systemConfig,
        rolesConfig,
        usersConfig,
        ingredientsConfig,
        tablesConfig,
        financialConfig,
        reservationPreferences,
        shippingConfig,
        shippingDriversConfig,
        systemData,
        systemLinkedCompanies,
        systemPreferences
    }
}
</script>
<style scoped>
.config-navigation { margin: 20px 0 18px; padding: 18px 18px 0; border: 1px solid var(--line, #e7e1d6); border-radius: 12px; background: var(--surface, #fff); box-shadow: 0 1px 4px rgba(43, 38, 32, .04); }
.navigation-label { margin: 0 0 10px 3px; color: var(--ink-soft, #6b6255); font-size: 10px; font-weight: 700; letter-spacing: .1em; }
.category-list, .subcategory-list { display: flex; gap: 6px; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
.category-list { padding: 0 0 15px; }
.category-button, .subcategory-button { flex: 0 0 auto; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color .15s, color .15s, border-color .15s; }
.category-button { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 9px 13px; border: 1px solid transparent; border-radius: 8px; color: var(--ink-soft, #6b6255); background: transparent; }
.category-button .material-icons { font-size: 19px; }
.category-button:hover { background: var(--paper, #f3f1ed); color: var(--ink, #2b2620); }
.category-button.is-active { background: var(--cor-destaque, #2e4f6c); border-color: var(--cor-destaque, #2e4f6c); color: #fff; }
.category-button:focus-visible, .subcategory-button:focus-visible { outline: 2px solid var(--cor-destaque, #2e4f6c); outline-offset: 2px; }
.subcategory-section { display: flex; align-items: center; gap: 16px; border-top: 1px solid var(--line, #e7e1d6); }
.subcategory-heading { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; padding: 15px 0; color: var(--ink-soft, #6b6255); font-size: 12px; font-weight: 700; }
.subcategory-heading .material-icons { font-size: 17px; }
.subcategory-list { min-width: 0; padding: 8px 3px; }
.subcategory-button { min-height: 38px; padding: 8px 12px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--ink-soft, #6b6255); }
.subcategory-button:hover { background: var(--paper, #f3f1ed); color: var(--ink, #2b2620); }
.subcategory-button.is-active { border-color: var(--cor-destaque, #2e4f6c); color: var(--cor-destaque, #2e4f6c); background: var(--surface, #fff); box-shadow: inset 0 -2px 0 var(--cor-destaque, #2e4f6c); }
.not-showing { text-align: center; }
@media (max-width: 700px) {
    .config-navigation { margin-top: 14px; padding: 14px 12px 0; }
    .category-list { padding-bottom: 12px; }
    .category-button { min-height: 44px; }
    .subcategory-section { display: block; }
    .subcategory-heading { padding: 12px 3px 2px; }
    .subcategory-list { padding: 7px 3px 12px; }
    .subcategory-button { min-height: 44px; }
}
</style>
